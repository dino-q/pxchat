import React, { useState, useEffect } from 'react';
import { splitText } from './services/fileSplitter';
import { getSummary } from './services/geminiService';
import FileUpload from './components/FileUpload';
import SplitOptions from './components/SplitOptions';
import FileList from './components/FileList';
import ActionPanel from './components/ActionPanel';

declare const JSZip: any;

export type SplitType = 'day' | 'month' | 'week';
export interface SplitFile {
  filename: string;
  content: string;
}

const App: React.FC = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [splitBy, setSplitBy] = useState<SplitType>('day');
  const [splitFiles, setSplitFiles] = useState<SplitFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<SplitFile[]>([]);
  const [prompt, setPrompt] = useState<string>('每件事的個人觀點整合成一段話，最多三句');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    if (fileContent) {
      try {
        const files = splitText(fileContent, splitBy);
        setSplitFiles(files);
        setSelectedFiles([]); // Reset selection on content/split change
        setSummary('');
        setError(null);
      } catch (e) {
        setError("Failed to process file. Ensure it contains dates in 'YYYY.MM.DD DayOfWeek' format.");
        setSplitFiles([]);
      }
    }
  }, [fileContent, splitBy]);

  const handleFileLoad = (content: string, name: string) => {
    setFileContent(content);
    setFileName(name);
  };

  const handleSelectFile = (fileToToggle: SplitFile) => {
    setSelectedFiles(prevSelected => {
      const isSelected = prevSelected.some(f => f.filename === fileToToggle.filename);
      if (isSelected) {
        return prevSelected.filter(f => f.filename !== fileToToggle.filename);
      } else {
        return [...prevSelected, fileToToggle];
      }
    });
  };

  const handleSummarize = async () => {
    if (selectedFiles.length === 0 || !prompt) return;

    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      const combinedContent = selectedFiles
        .map(file => `--- START OF ${file.filename} ---\n\n${file.content}\n\n--- END OF ${file.filename} ---`)
        .join('\n\n');
      const result = await getSummary(combinedContent, prompt);
      setSummary(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to get summary: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (selectedFiles.length === 0) return;

    if (selectedFiles.length === 1) {
      const selectedFile = selectedFiles[0];
      const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = selectedFile.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const zip = new JSZip();
      selectedFiles.forEach(file => {
        zip.file(file.filename, file.content);
      });
      
      try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName.replace('.txt', '')}_split_files.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch(e) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
          setError(`Failed to create zip file: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">TXT File Splitter & Summarizer</h1>
          <p className="mt-2 text-lg text-brand-text-secondary">Split, analyze, and download your text files with ease.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Controls and File List */}
          <div className="flex flex-col gap-6">
            <FileUpload onFileLoad={handleFileLoad} fileName={fileName} />
            
            {fileContent && (
              <>
                <SplitOptions selected={splitBy} onChange={setSplitBy} />
                <FileList 
                  files={splitFiles} 
                  selectedFiles={selectedFiles} 
                  onSelect={handleSelectFile} 
                />
              </>
            )}
          </div>

          {/* Right Column: Actions and Summary */}
          <div className="flex flex-col gap-6">
            <ActionPanel
              selectedFiles={selectedFiles}
              prompt={prompt}
              onPromptChange={setPrompt}
              onSummarize={handleSummarize}
              onDownload={handleDownload}
              isLoading={isLoading}
              summary={summary}
              error={error}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
