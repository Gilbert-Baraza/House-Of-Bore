const DataTable = ({ columns, rows, emptyText = "No data available" }) => (
  <div className="table-card">
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="empty-cell">
              {emptyText}
            </td>
          </tr>
        ) : (
          rows.map((row, rowIndex) => (
            <tr key={row.id || row._id || rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>
                  {typeof column.render === "function" ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default DataTable;
