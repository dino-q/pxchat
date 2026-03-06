
import React, { useState, useMemo } from 'react';
import { SplitFile } from '../App';

interface FileListProps {
  files: SplitFile[];
  selectedFiles: SplitFile[];
  onSelect: (file: SplitFile) => void;
}

const FileList: React.FC<FileListProps> = ({ files, selectedFiles, onSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null); // e.g., "2025-08"

  const dateStructure = useMemo(() => {
    const structure: { [year: string]: Set<string> } = {};
    files.forEach(file => {
      const match = file.filename.match(/^(\d{4}-\d{2})/);
      if (match) {
        const [year, month] = match[0].split('-');
         if (year && month) {
          if (!structure[year]) {
            structure[year] = new Set();
          }
          structure[year].add(month);
        }
      }
    });
    const finalStructure: { [year: string]: string[] } = {};
    for (const year in structure) {
      finalStructure[year] = Array.from(structure[year]).sort((a, b) => b.localeCompare(a));
    }
    return finalStructure;
  }, [files]);

  const years = useMemo(() => Object.keys(dateStructure).sort((a, b) => b.localeCompare(a)), [dateStructure]);

  const filteredFiles = useMemo(() => {
    if (!filter) return files;
    return files.filter(file => file.filename.startsWith(filter));
  }, [files, filter]);

  const displayedFiles = filteredFiles.slice(0, 5);
  const hasMore = filteredFiles.length > 5;
  const isFiltered = filter !== null;

  const handleSetFilter = (year: string, month: string) => {
    setFilter(`${year}-${month}`);
    setIsModalOpen(false);
    setActiveYear(null);
  };
  
  const handleClearFilter = () => {
    setFilter(null);
    setIsModalOpen(false);
    setActiveYear(null);
  };

  if (files.length === 0) {
    return (
        <div className="bg-brand-surface rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">3. Select a File</h2>
            <div className="text-center py-8 text-brand-text-secondary">
                <p>No files to display. Upload a file to get started.</p>
            </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">3. Select a File</h2>
        {(files.length > 5 || isFiltered) && (
            <div className="flex items-center space-x-4">
                {isFiltered && (
                    <button onClick={handleClearFilter} className="text-sm text-brand-text-secondary hover:underline">
                        Clear Filter
                    </button>
                )}
                 <button onClick={() => setIsModalOpen(true)} className="text-sm text-brand-secondary hover:underline font-semibold">
                    More...
                 </button>
            </div>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto pr-2">
        {filteredFiles.length > 0 ? (
          <ul className="space-y-2">
            {displayedFiles.map((file) => (
              <li key={file.filename}>
                <button
                  onClick={() => onSelect(file)}
                  className={`w-full text-left py-3 px-4 rounded-md transition-all duration-200 text-sm ${
                    selectedFiles.some(sf => sf.filename === file.filename)
                      ? 'bg-brand-secondary text-white font-semibold shadow'
                      : 'bg-brand-primary text-brand-text hover:bg-opacity-80 hover:text-white'
                  }`}
                >
                  {file.filename}
                </button>
              </li>
            ))}
            {hasMore && (
                <li className="text-center text-xs text-brand-text-secondary pt-2">
                    ... and {filteredFiles.length - 5} more. Use "More..." to filter.
                </li>
            )}
          </ul>
        ) : (
          <div className="text-center py-8 text-brand-text-secondary">
            <p>No files match the current filter.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={handleClearFilter}>
          <div className="bg-brand-surface rounded-lg shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Select by Date</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-text-secondary hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="flex flex-col space-y-4">
                {years.map(year => (
                  <div key={year}>
                    <button 
                        onClick={() => setActiveYear(activeYear === year ? null : year)} 
                        className="w-full text-left font-semibold text-lg text-white py-2 flex justify-between items-center"
                    >
                      <span>{year}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${activeYear === year ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    {activeYear === year && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 pl-4">
                            {dateStructure[year].map(month => (
                                <button
                                    key={month}
                                    onClick={() => handleSetFilter(year, month)}
                                    className="bg-brand-primary text-brand-text rounded py-2 px-3 hover:bg-brand-secondary hover:text-white transition-colors"
                                >
                                    {month}月
                                </button>
                            ))}
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
             <div className="mt-4 border-t border-brand-primary pt-4">
                <button onClick={handleClearFilter} className="w-full bg-brand-primary text-brand-text rounded py-2 px-4 hover:bg-opacity-80 transition-colors">
                    Show All Files ({files.length})
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;