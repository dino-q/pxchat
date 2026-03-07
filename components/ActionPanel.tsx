import React, { useState, useEffect } from 'react';
import { SplitFile } from '../App';

interface ActionPanelProps {
  selectedFiles: SplitFile[];
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSummarize: () => void;
  onDownload: () => void;
  isLoading: boolean;
  summary: string;
  error: string | null;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedFiles,
  prompt,
  onPromptChange,
  onSummarize,
  onDownload,
  isLoading,
  summary,
  error,
}) => {
  const fileIsSelected = selectedFiles.length > 0;
  const downloadButtonText = selectedFiles.length > 1 ? `Download Files (${selectedFiles.length}) .zip` : 'Download File';
  const [renderedHtml, setRenderedHtml] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isLoading || error || !summary) {
      setRenderedHtml('');
      return;
    }

    try {
      const RemarkableLib = (window as any).Remarkable;
      let md;

      if (typeof RemarkableLib === 'function') {
        // Case 1: window.Remarkable is the constructor
        md = new RemarkableLib();
      } else if (RemarkableLib && typeof RemarkableLib.default === 'function') {
        // Case 2: window.Remarkable is an object with a 'default' constructor
        md = new RemarkableLib.default();
      }

      if (md) {
        setRenderedHtml(md.render(summary));
      } else {
        // Fallback if library is not loaded or in an unexpected format
        console.warn('Remarkable library not available, falling back to plain text.');
        const escapedText = summary.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        setRenderedHtml(`<pre class="whitespace-pre-wrap">${escapedText}</pre>`);
      }
    } catch (e) {
      console.error('Failed to render markdown:', e);
      // Fallback on any rendering error
      const escapedText = summary.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      setRenderedHtml(`<pre class="whitespace-pre-wrap">${escapedText}</pre>`);
    }
  }, [summary, isLoading, error]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy summary: ", err);
      });
  };


  return (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold text-white mb-4">Analyze & Download</h2>
      
      {!fileIsSelected && (
        <div className="flex-grow flex items-center justify-center text-center text-brand-text-secondary">
          <p>Select one or more files from the list to enable actions.</p>
        </div>
      )}
      
      {fileIsSelected && (
        <div className="flex flex-col gap-6 flex-grow">
            <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-brand-text mb-2">
                    Custom AI Prompt
                </label>
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    rows={4}
                    className="w-full bg-brand-primary border border-brand-primary rounded-md p-3 text-brand-text placeholder-brand-text-secondary focus:ring-2 focus:ring-brand-secondary focus:outline-none transition"
                    placeholder="Enter your summarization prompt here..."
                />
            </div>
          
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onSummarize}
                disabled={!fileIsSelected || isLoading}
                className="flex-1 inline-flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11.983 1.904a1 1 0 00-1.212-.693l-6 2A1 1 0 004 4.118V15.882a1 1 0 00.771.975l6 2a1 1 0 001.212-.693l2-6A1 1 0 0014 11.173V4.827a1 1 0 00-.788-.973l-2-6zM5 4.618l5-1.667v10.098l-5 1.667V4.618zM13 5.382v5.236l-1-0.333V5.049l1 .333z" />
                  </svg>
                )}
                {isLoading ? 'Summarizing...' : 'Generate Summary'}
              </button>
              <button
                onClick={onDownload}
                disabled={!fileIsSelected}
                className="flex-1 inline-flex items-center justify-center py-3 px-4 border border-brand-primary text-sm font-medium rounded-md text-brand-text bg-brand-primary hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {downloadButtonText}
              </button>
            </div>
            
            {(summary || error || isLoading) && (
              <div className="mt-4 flex-grow flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">Summary Result:</h3>
                   {summary && !isLoading && !error && (
                    <button
                      onClick={handleCopy}
                      title="Copy summary"
                      aria-label="Copy summary text"
                      className="p-1 rounded-md text-brand-text-secondary hover:text-white hover:bg-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary"
                    >
                      {isCopied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
                <div className="bg-brand-primary rounded-md p-4 flex-grow overflow-y-auto min-h-[150px] text-sm">
                  {isLoading && <p className="text-brand-text-secondary animate-pulse">Generating summary, please wait...</p>}
                  {error && <p className="text-red-400">{error}</p>}
                  {summary && !isLoading && !error && (
                    <div
                      className="prose prose-sm sm:prose-base prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    />
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ActionPanel;