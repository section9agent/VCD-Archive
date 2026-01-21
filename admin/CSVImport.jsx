import React, { useState } from 'react';
import { base44 } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CSVImport() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      const records = [];
      let errors = 0;

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.trim().replace(/^"|"$/g, '')) || [];
          
          const record = {
            title: values[0] || '',
            publisher: values[1] || '',
            number_of_discs: parseInt(values[2]) || 1,
            audio_language: values[3] || '',
            subtitle_language: values[4] || '',
            country: values[5] || '',
            download_link: values[6] || '',
            notes: values[7] || '',
            cover_art: values[8] || '',
            back_art: values[9] || '',
            disc_images: values[10] ? values[10].split('|').filter(Boolean) : [],
            additional_images: values[11] ? values[11].split('|').filter(Boolean) : []
          };

          if (record.title) {
            records.push(record);
          }
        } catch (e) {
          errors++;
        }
      }

      if (records.length > 0) {
        await base44.entities.Release.bulkCreate(records);
        queryClient.invalidateQueries({ queryKey: ['releases'] });
        setResult({
          success: true,
          message: `Successfully imported ${records.length} VCDs`,
          count: records.length,
          errors
        });
      } else {
        setResult({
          success: false,
          message: 'No valid records found in CSV file'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Import failed: ${error.message}`
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Title', 'Publisher', 'Number of Discs', 'Audio Language', 'Subtitle Language', 'Country', 'Download Link', 'Notes', 'Cover Art', 'Back Art', 'Disc Images', 'Additional Images'].join(','),
      ['"Example VCD Title"', '"Example Publisher"', '1', '"English"', '"Chinese"', '"Hong Kong"', '"https://example.com"', '"Example notes"', '"https://example.com/cover.jpg"', '"https://example.com/back.jpg"', '"https://example.com/disc1.jpg|https://example.com/disc2.jpg"', '"https://example.com/img1.jpg|https://example.com/img2.jpg"'].join(',')
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vcd-import-template.csv';
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Import VCDs from CSV</h2>
        <p className="text-slate-500">Upload a CSV file to bulk import VCD entries</p>
      </div>

      {/* Template Download */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-medium mb-1">Need a template?</p>
            <p className="text-sm text-blue-700 mb-3">Download our CSV template to see the correct format</p>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2 border-blue-200 hover:bg-blue-100">
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-slate-700">
          Select CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100
            file:cursor-pointer cursor-pointer"
        />
        {file && (
          <p className="mt-2 text-sm text-slate-500">Selected: {file.name}</p>
        )}
      </div>

      {/* Import Button */}
      <Button
        onClick={handleImport}
        disabled={!file || importing}
        className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
      >
        {importing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Import VCDs
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <Alert className={`mt-6 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <AlertDescription className={result.success ? 'text-green-900' : 'text-red-900'}>
              {result.message}
              {result.errors > 0 && (
                <p className="text-sm mt-1">Note: {result.errors} rows had errors and were skipped</p>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Format Guide */}
      <div className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">CSV Format Guide</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• First row must contain column headers</li>
          <li>• Separate multiple disc/additional images with | character</li>
          <li>• Enclose text with commas in quotes</li>
          <li>• Title is required, all other fields are optional</li>
        </ul>
      </div>
    </div>
  );
}