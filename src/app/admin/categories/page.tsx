'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenEdit = (cat: any) => {
    setEditingCategory({
      id: cat.id,
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      icon: cat.icon || 'Folder',
      order: cat.order ?? 0,
      h1Title: cat.h1Title || '',
      metaTitle: cat.metaTitle || '',
      metaDescription: cat.metaDescription || '',
      focusKeyword: cat.focusKeyword || '',
    });
  };

  const handleOpenNew = () => {
    setEditingCategory({
      id: '',
      name: '',
      slug: '',
      description: '',
      icon: 'Folder',
      order: categories.length,
      h1Title: '',
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccessMessage('');

    try {
      const isNew = !editingCategory.id;
      const url = isNew ? '/api/admin/categories' : `/api/admin/categories/${editingCategory.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessMessage(isNew ? 'Category created successfully!' : 'Category updated successfully!');
        setEditingCategory(null);
        fetchCategories();
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save category.');
      }
    } catch {
      setErrorMessage('Network error while saving category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? (Only categories with 0 tools can be deleted)')) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.error || 'Failed to delete category');
      }
    } catch {
      alert('Error deleting category');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-neutral-800" /> Category Management
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage tool categories, URL slugs, descriptions, and category-level SEO metadata.
            </p>
          </div>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>

        {/* Notifications */}
        {saveSuccessMessage && (
          <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            {saveSuccessMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-16 text-center flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              <span className="text-xs text-neutral-500 font-semibold">Loading categories...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Tools Count</th>
                    <th className="py-3 px-4">SEO Meta Title</th>
                    <th className="py-3 px-4">Focus Keyword</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-neutral-900">{cat.name}</td>
                      <td className="py-3 px-4 font-mono text-neutral-600 text-[11px]">{cat.slug}</td>
                      <td className="py-3 px-4">
                        <span className="bg-neutral-100 text-neutral-800 font-bold px-2 py-0.5 rounded-full text-[11px]">
                          {cat._count?.tools ?? 0} tools
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-700 max-w-xs truncate">{cat.metaTitle || cat.name}</td>
                      <td className="py-3 px-4 text-neutral-600">{cat.focusKeyword || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          {cat._count?.tools === 0 && (
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit / Create Modal */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900">
                  {editingCategory.id ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Category Name</label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400 font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={editingCategory.slug}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                        })
                      }
                      className="w-full px-3.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Description</label>
                  <textarea
                    rows={2}
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Category SEO Meta Title</label>
                  <input
                    type="text"
                    value={editingCategory.metaTitle}
                    onChange={(e) => setEditingCategory({ ...editingCategory, metaTitle: e.target.value })}
                    placeholder="e.g., PDF Tools Online — Free & Fast | Numvax"
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-neutral-700">Category Meta Description</label>
                  <textarea
                    rows={2}
                    value={editingCategory.metaDescription}
                    onChange={(e) => setEditingCategory({ ...editingCategory, metaDescription: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Focus Keyword</label>
                    <input
                      type="text"
                      value={editingCategory.focusKeyword}
                      onChange={(e) => setEditingCategory({ ...editingCategory, focusKeyword: e.target.value })}
                      placeholder="e.g., pdf tools"
                      className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">Sort Order</label>
                    <input
                      type="number"
                      value={editingCategory.order}
                      onChange={(e) => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
