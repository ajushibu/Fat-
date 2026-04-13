import { useState, useRef } from 'react';
import { Upload, FileJson, FileText } from 'lucide-react';
import { useDataIO } from '../../hooks/useDataIO';
import { useWeights, useMeals } from '../../store';
import toast from 'react-hot-toast';

export function ExportPanel() {
  const { exportJSON, exportWeightCSV, exportNutritionCSV, importJSON } = useDataIO();
  const weights = useWeights();
  const meals = useMeals();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const result = await importJSON(file);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setImporting(false);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Export Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700"
          >
            <FileJson size={16} className="text-indigo-500" />
            <div className="text-left">
              <p className="font-medium">Full Backup (JSON)</p>
              <p className="text-xs text-gray-400">All data, importable</p>
            </div>
          </button>
          <button
            onClick={exportWeightCSV}
            disabled={weights.length === 0}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText size={16} className="text-emerald-500" />
            <div className="text-left">
              <p className="font-medium">Weight Log (CSV)</p>
              <p className="text-xs text-gray-400">{weights.length} entries</p>
            </div>
          </button>
          <button
            onClick={exportNutritionCSV}
            disabled={meals.length === 0}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText size={16} className="text-blue-500" />
            <div className="text-left">
              <p className="font-medium">Nutrition Log (CSV)</p>
              <p className="text-xs text-gray-400">{meals.length} entries</p>
            </div>
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Import Data</h3>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-sm font-medium text-gray-600 w-full justify-center"
        >
          {importing ? (
            <span className="text-gray-400">Importing...</span>
          ) : (
            <>
              <Upload size={15} />
              Import JSON backup (merges with existing data)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
