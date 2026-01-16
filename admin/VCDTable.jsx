import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Pencil, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function VCDTable({ releases, isLoading, onDelete }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [sortField, setSortField] = useState('created_date');
  const [sortDirection, setSortDirection] = useState('desc');

  const filteredReleases = useMemo(() => {
    let filtered = releases.filter(r => 
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.publisher?.toLowerCase().includes(search.toLowerCase()) ||
      r.country?.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'created_date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [releases, search, sortField, sortDirection]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredReleases.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredReleases.map(r => r.id)));
    }
  };

  const handleDeleteSelected = () => {
    onDelete(Array.from(selected));
    setSelected(new Set());
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-slate-300" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-indigo-600" /> : 
      <ChevronDown className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search VCDs..."
            className="pl-10"
          />
        </div>
        
        {selected.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete {selected.size} selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selected.size} VCDs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the selected VCDs. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-500 hover:bg-red-600">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selected.size === filteredReleases.length && filteredReleases.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button 
                  onClick={() => toggleSort('title')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-slate-900"
                >
                  Title
                  <SortIcon field="title" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button 
                  onClick={() => toggleSort('publisher')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-slate-900"
                >
                  Publisher
                  <SortIcon field="publisher" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button 
                  onClick={() => toggleSort('country')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-slate-900"
                >
                  Country
                  <SortIcon field="country" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button 
                  onClick={() => toggleSort('created_date')}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-slate-900"
                >
                  Added
                  <SortIcon field="created_date" />
                </button>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReleases.map((release) => (
              <tr key={release.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selected.has(release.id)}
                    onCheckedChange={() => toggleSelect(release.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link to={createPageUrl(`ReleaseDetail?id=${release.id}`)} className="font-medium text-slate-900 hover:text-indigo-600">
                    {release.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{release.publisher || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{release.country || '-'}</td>
                <td className="px-4 py-3 text-slate-600 text-sm">
                  {new Date(release.created_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={createPageUrl(`EditRelease?id=${release.id}`)}>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredReleases.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          {search ? 'No VCDs found' : 'No VCDs in database'}
        </div>
      )}
    </div>
  );
}