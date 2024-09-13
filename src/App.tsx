import React, { useRef, useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import axios from 'axios';

import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export default function CheckboxRowSelectionDemo() {
  const [products, setProducts] = useState<Artwork[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Artwork[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Artwork[]>([]);
  const [rowClick, setRowClick] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRowsMap, setSelectedRowsMap] = useState<Map<number, Artwork[]>>(new Map());
  const op = useRef<OverlayPanel>(null);
  const [rowCount, setRowCount] = useState(0); // State for the number of rows to select

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data = response.data;
      const artworks = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));
      setProducts(artworks);
      setFilteredProducts(artworks); // Set both products and filteredProducts initially
      setTotalRecords(data.pagination.total);
      persistSelectionAcrossPages(page);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onPageChange = (event: any) => {
    setCurrentPage(event.page + 1); // PrimeReact is zero-indexed
  };

  const onSelectionChange = (e: any) => {
    const selected = e.value;
    setSelectedProducts(selected);
    updateSelectionForPage(currentPage, selected);
  };

  const updateSelectionForPage = (page: number, selectedRows: Artwork[]) => {
    const updatedMap = new Map(selectedRowsMap);
    updatedMap.set(page, selectedRows);
    setSelectedRowsMap(updatedMap);
  };

  const persistSelectionAcrossPages = (page: number) => {
    const persistedSelection = selectedRowsMap.get(page);
    if (persistedSelection) {
      setSelectedProducts(persistedSelection);
    } else {
      setSelectedProducts([]);
    }
  };

  // Handle row selection from user input
  const handleRowSelectionSubmit = () => {
    const rowsToSelect = Math.min(rowCount, filteredProducts.length); // Ensure not exceeding total rows
    const selected = filteredProducts.slice(0, rowsToSelect); // Select the first N rows
    setSelectedProducts(selected);
    updateSelectionForPage(currentPage, selected);
    op.current?.hide();
  };

  const toggleButtonTemplate = () => (
    <>
      <Button
        icon="pi pi-search"
        className="p-button-rounded p-button-secondary p-button-sm" // Added p-button-sm for smaller size
        onClick={(e) => op.current?.toggle(e)} // Show overlay when clicked
        style={{ fontSize: '0.75rem' }} 
      />
      <OverlayPanel ref={op} style={{ width: '250px' }}>
        <div className="p-inputgroup">
          <InputText
            placeholder="Number of rows to select"
            onChange={(e) => setRowCount(parseInt(e.target.value) || 0)} // Handle number input
            className="p-inputtext-sm"
            type="number"
            min="1"
            max={products.length} // Restrict the max number to the available rows
          />
          <Button
            label="Select Rows"
            icon="pi pi-check"
            style={{ color: 'white' }}
            onClick={handleRowSelectionSubmit} // Submit the number of rows selected
          />
        </div>
      </OverlayPanel>
    </>
  );

  const titleHeaderTemplate = () => (
    <div className="flex align-items-center">
      {toggleButtonTemplate()}
      <span style={{ marginLeft: '2rem' }}>Title</span> 
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={filteredProducts} // Use the filteredProducts for display
        paginator
        rows={10}
        totalRecords={totalRecords}
        lazy
        onPage={onPageChange}
        selectionMode={rowClick ? null : 'checkbox'}
        selection={selectedProducts}
        onSelectionChange={onSelectionChange}
        dataKey="id"
        tableStyle={{ minWidth: '50rem' }}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="title" header={titleHeaderTemplate} style={{ minWidth: '14rem' }}></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Date Start"></Column>
        <Column field="date_end" header="Date End"></Column>
      </DataTable>
    </div>
  );
}
