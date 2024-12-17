
import {
  ChevronLeftIcon,
  ChevronsLeft,
  ChevronRightIcon,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for the props
interface PaginationProps {
  currentPage: number;
  rowsPerPage: number;
  totalItems: number;
  setCurrentPage: (value: number) => void;
  setRowsPerPage: (value: number) => void;
}

function Pagination(props: PaginationProps) {
  const {
    currentPage,
    rowsPerPage,
    totalItems,
    setCurrentPage,
    setRowsPerPage,
  } = props;

  // Total number of pages (replace with your actual logic)
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(parseInt(value, 10));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };

  return (
    <div className="flex items-center justify-between space-x-4 mt-8 text-sm">
      {/* Rows per page dropdown */}
      <div className="text-sm text-gray-500">
        {`1 of ${Math.ceil(totalItems / rowsPerPage)} selected`}
      </div>
      <div className="flex items-center">
        <div className="flex items-center space-y-0 mr-8">
          <span className="mr-4">Rows per page</span>
          <Select
            onValueChange={handleRowsPerPageChange}
            value={rowsPerPage.toString()}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder={rowsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Rows</SelectLabel>
                <SelectItem value="5">5</SelectItem>
                <SelectItem disabled={totalItems < 10} value="10">10</SelectItem>
                <SelectItem disabled={totalItems < 15} value="15">15</SelectItem>
                <SelectItem disabled={totalItems < 20} value="20">20</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Page information */}
        <div className="mr-8">
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center space-x-2">
          {/* First page button */}
          <button
            className="p-2 rounded outline outline-1 outline-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous page button */}
          <button
            className="p-2 rounded outline outline-1 outline-gray-300 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          {/* Next page button */}
          <button
            className="p-2 rounded outline outline-1 outline-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages || totalItems < rowsPerPage}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>

          {/* Last page button */}
          <button
            className="p-2 rounded outline outline-1 outline-gray-300 disabled:opacity-50"
            disabled={currentPage === totalPages || totalItems < rowsPerPage}
            onClick={() => handlePageChange(totalPages)}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
