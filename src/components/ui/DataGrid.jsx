import React from 'react';

const DataGrid = ({
    columns,
    data,
    sortConfig,
    onSort,
    keyExtractor,
    emptyMessage = "NO DATA FOUND"
}) => {

    const SortIcon = ({ columnKey }) => {
        if (!sortConfig || sortConfig.key !== columnKey) return <span className="text-gray-500 opacity-50">↕</span>;
        return <span className="text-cyber-primary">{sortConfig.direction === 'ASC' ? '↑' : '↓'}</span>;
    };

    return (
        <div className="overflow-auto w-full font-mono">
            <table className="w-full text-left border-collapse whitespace-nowrap lg:whitespace-normal">
                <thead>
                    <tr className="text-cyber-primary border-b border-cyber-primary/30 uppercase text-xs tracking-widest bg-cyber-primary/5">
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`p-3 ${(col.sortable && onSort) ? 'cursor-pointer select-none hover:bg-cyber-primary/10 transition-colors' : ''} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                                onClick={() => col.sortable && onSort && onSort(col.key)}
                            >
                                <div className={`flex items-center gap-2 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'} ${col.headerClassName || ''}`}>
                                    {col.label}
                                    {col.sortable && <SortIcon columnKey={col.key} />}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="p-8 text-center text-gray-500 border-b border-gray-800/50">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr data-testid={`datagrid-row-${rowIndex}`} key={keyExtractor ? keyExtractor(row) : rowIndex} className="border-b border-gray-800 hover:bg-white/5 transition-colors group">
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`p-3 text-sm ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.cellClassName ? (typeof col.cellClassName === 'function' ? col.cellClassName(row) : col.cellClassName) : 'text-gray-300'}`}
                                    >
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataGrid;
