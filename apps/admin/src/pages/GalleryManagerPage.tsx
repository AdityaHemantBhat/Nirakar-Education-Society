import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building2,
  Layers,
  Sparkles,
  X,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Search,
} from 'lucide-react';

interface GalleryItem {
  id?: string;
  title: string;
  mediaUrl: string;
  caption?: string;
  order?: number;
}

interface GalleryAlbum {
  id: string;
  institutionCode?: 'NIRAKAR_HS' | 'TUDAL_HS' | 'ANGLE_HSS' | null;
  title: string;
  description?: string;
  category: string;
  coverUrl?: string;
  createdAt: string;
  items: GalleryItem[];
}

const INSTITUTIONS = [
  { code: 'all', label: 'All Society Campuses' },
  { code: 'NIRAKAR_HS', label: 'Shri Nirakar High School (Mashem)' },
  { code: 'TUDAL_HS', label: 'Tudal High School (Gaondongrem)' },
  { code: 'ANGLE_HSS', label: 'S.S. Angle Higher Secondary (Dapot)' },
];

const CATEGORIES = [
  'Campus & Heritage',
  'STEM & Robotics',
  'Sports & Athletics',
  'Cultural & Heritage',
  'Academic Life',
  'Annual Gatherings',
  'Alumni & Celebrations',
];

const PAGE_SIZE = 12;

export const GalleryManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedInstFilter, setSelectedInstFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingItem, setUploadingItem] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Campus & Heritage',
    institutionCode: 'NIRAKAR_HS' as 'NIRAKAR_HS' | 'TUDAL_HS' | 'ANGLE_HSS' | '',
    coverUrl: '',
    items: [] as GalleryItem[],
  });

  // New photo input in editor
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCaption, setNewItemCaption] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');

  // Fetch albums
  const { data: albums = [], isLoading } = useQuery<GalleryAlbum[]>({
    queryKey: ['adminGalleries', selectedInstFilter],
    queryFn: async () => {
      const url =
        selectedInstFilter === 'all'
          ? '/api/v1/content/galleries'
          : `/api/v1/content/galleries?institutionCode=${encodeURIComponent(selectedInstFilter)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load gallery albums');
      const json = await res.json();
      return json.data || [];
    },
  });

  // Filtered albums by search
  const filteredAlbums = React.useMemo(() => {
    return albums.filter((album) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        album.title.toLowerCase().includes(q) ||
        (album.description && album.description.toLowerCase().includes(q)) ||
        (album.category && album.category.toLowerCase().includes(q))
      );
    });
  }, [albums, searchQuery]);

  // Paginated albums
  const totalAlbums = filteredAlbums.length;
  const totalPages = Math.ceil(totalAlbums / PAGE_SIZE) || 1;
  const paginatedAlbums = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAlbums.slice(start, start + PAGE_SIZE);
  }, [filteredAlbums, currentPage]);

  // Reset to page 1 on filter/search change
  const handleFilterChange = (code: string) => {
    setSelectedInstFilter(code);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Create or Update mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const url = editingAlbum
        ? `/api/v1/content/galleries/${editingAlbum.id}`
        : '/api/v1/content/galleries';
      const method = editingAlbum ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to save gallery album');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleries'] });
      setIsModalOpen(false);
      setEditingAlbum(null);
      showToast(editingAlbum ? 'Album updated successfully!' : 'Album created successfully!', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Error saving album', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/content/galleries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete album');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleries'] });
      showToast('Album deleted permanently', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Error deleting album', 'error');
    },
  });

  const showToast = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const openCreateModal = () => {
    setEditingAlbum(null);
    setFormData({
      title: '',
      description: '',
      category: 'Campus & Heritage',
      institutionCode: selectedInstFilter !== 'all' ? (selectedInstFilter as any) : 'NIRAKAR_HS',
      coverUrl: '',
      items: [],
    });
    setNewItemTitle('');
    setNewItemCaption('');
    setNewItemUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setFormData({
      title: album.title,
      description: album.description || '',
      category: album.category || 'Campus & Heritage',
      institutionCode: album.institutionCode || 'NIRAKAR_HS',
      coverUrl: album.coverUrl || '',
      items: (album.items || []).map((it) => ({
        id: it.id,
        title: it.title || '',
        caption: it.caption || '',
        mediaUrl: it.mediaUrl,
        order: it.order ?? 0,
      })),
    });
    setNewItemTitle('');
    setNewItemCaption('');
    setNewItemUrl('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File, isCover: boolean = false) => {
    const setter = isCover ? setUploadingCover : setUploadingItem;
    setter(true);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/v1/content/media/upload', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      const mediaUrl = json.data?.url || json.data?.fileUrl;

      if (isCover) {
        setFormData((prev) => ({ ...prev, coverUrl: mediaUrl }));
        showToast('Album cover image uploaded', 'success');
      } else {
        setNewItemUrl(mediaUrl);
        showToast('Photo uploaded ready to add', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setter(false);
    }
  };

  const handleAddPhotoItem = () => {
    if (!newItemUrl) {
      showToast('Please select or upload a photo first', 'error');
      return;
    }

    const newItem: GalleryItem = {
      title: newItemTitle || formData.title,
      caption: newItemCaption || '',
      mediaUrl: newItemUrl,
      order: formData.items.length,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      // If no cover is set, use the first photo as cover
      coverUrl: prev.coverUrl || newItemUrl,
    }));

    setNewItemTitle('');
    setNewItemCaption('');
    setNewItemUrl('');
  };

  const handleRemovePhotoItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter an album title', 'error');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      institutionCode: formData.institutionCode || null,
      coverUrl: formData.coverUrl || formData.items[0]?.mediaUrl || null,
      items: formData.items,
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 space-y-6 font-sans">
      {/* Toast Notification */}
      {statusMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-800 text-white border border-emerald-700'
              : 'bg-red-800 text-white border border-red-700'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Header — Full Width Stretched */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>Visual Archives &amp; Campus Memories</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            Photo Gallery Manager
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Curate photo albums, annual sports meets, STEM fairs, and cultural celebrations across all 3 institutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/gallery"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold font-mono uppercase tracking-wider transition-colors"
          >
            <span>View Public Gallery</span>
            <ExternalLink size={13} />
          </a>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#111b5e] hover:bg-[#0b132b] text-white px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={15} />
            <span>Create New Album</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar — Full Width */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-stone-500 uppercase tracking-wider mr-1">Campus:</span>
          <div className="flex flex-wrap gap-1.5">
            {INSTITUTIONS.map((inst) => (
              <button
                key={inst.code}
                onClick={() => handleFilterChange(inst.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  selectedInstFilter === inst.code
                    ? 'bg-[#111b5e] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {inst.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Box */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-900 bg-stone-50/60 focus:outline-none focus:ring-2 focus:ring-[#111b5e]/20 focus:border-[#111b5e]"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-stone-500 shrink-0">
            Total: <span className="font-bold text-stone-900">{totalAlbums}</span>
          </div>
        </div>
      </div>

      {/* Grid of Albums — Full Width Stretched */}
      {isLoading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 rounded-full border-2 border-[#111b5e] border-t-transparent animate-spin mx-auto mb-3" />
          <span>Loading gallery albums...</span>
        </div>
      ) : paginatedAlbums.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 space-y-4">
          <ImageIcon size={44} className="mx-auto text-stone-400" />
          <h3 className="font-serif text-lg font-bold text-stone-800">No photo albums found</h3>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            {searchQuery
              ? 'No albums match your search query. Try clearing the search box.'
              : 'Create your first campus photo album to showcase academic life, sports championships, and cultural moments.'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-[#111b5e] text-white px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
          >
            <Plus size={15} />
            <span>Create Album Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-5">
          {paginatedAlbums.map((album) => {
            const instInfo = INSTITUTIONS.find((i) => i.code === album.institutionCode);
            const cover = album.coverUrl || album.items?.[0]?.mediaUrl || '/images/science_lab.jpg';

            return (
              <div
                key={album.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                  <img
                    src={cover}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-[#0b132b]/85 backdrop-blur-md text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-sm">
                      {album.institutionCode ? album.institutionCode.replace('_', ' ') : 'General'}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                      <Layers size={10} className="text-amber-300" />
                      <span>{album.items?.length || 0}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-semibold block">
                      {album.category}
                    </span>
                    <h3 className="font-serif font-bold text-stone-900 text-sm mt-0.5 line-clamp-2 leading-snug group-hover:text-[#111b5e]">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {album.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-stone-400">
                      {new Date(album.createdAt).toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(album)}
                        className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                        title="Edit Album & Photos"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${album.title}" and its photos?`)) {
                            deleteMutation.mutate(album.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                        title="Delete Album"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar — Full Width */}
      {totalAlbums > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <p className="text-xs text-stone-500 font-mono">
            Showing <strong className="text-stone-900">{(currentPage - 1) * PAGE_SIZE + 1}</strong> to{' '}
            <strong className="text-stone-900">{Math.min(currentPage * PAGE_SIZE, totalAlbums)}</strong> of{' '}
            <strong className="text-stone-900">{totalAlbums}</strong> albums
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-mono font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#111b5e] text-white shadow-2xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-mono font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Album Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-fadeIn my-auto">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight">
                    {editingAlbum ? 'Edit Campus Photo Album' : 'Create New Campus Album'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload photos and describe the event across Mashem, Gaondongrem, or Dapot.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Album Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Sports & Athletic Meet at Mashem Pavilion"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#111b5e]/20 focus:border-[#111b5e]"
                  />
                </div>

                {/* Institution */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Institution / Campus *
                  </label>
                  <select
                    value={formData.institutionCode}
                    onChange={(e) => setFormData({ ...formData, institutionCode: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#111b5e]/20 focus:border-[#111b5e] bg-white"
                  >
                    <option value="NIRAKAR_HS">Shri Nirakar High School (Mashem)</option>
                    <option value="TUDAL_HS">Tudal High School (Gaondongrem)</option>
                    <option value="ANGLE_HSS">S.S. Angle Higher Secondary (Dapot)</option>
                    <option value="">Society-wide / General</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#111b5e]/20 focus:border-[#111b5e] bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Description &amp; Highlights
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief background of the activities, student achievements, and community attendance..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#111b5e]/20 focus:border-[#111b5e]"
                  />
                </div>

                {/* Album Cover Photo */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Cover Image URL or File
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="https://... or upload below"
                      value={formData.coverUrl}
                      onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                    />
                    <label className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-bold font-mono uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload size={13} />
                      <span>{uploadingCover ? 'Uploading...' : 'Upload Cover'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, true);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Photos Section */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                    <Layers size={17} className="text-amber-600" />
                    <span>Album Photographs ({formData.items.length})</span>
                  </h4>
                  <span className="text-xs font-mono text-stone-500">
                    Add high-resolution photos for the album
                  </span>
                </div>

                {/* Add Photo Input Box */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/90 space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 block">
                    + Add A Photo To Album
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        placeholder="Image URL or upload directly..."
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono bg-white"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="w-full h-full px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-bold font-mono uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer">
                        <Upload size={13} />
                        <span>{uploadingItem ? 'Uploading...' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, false);
                          }}
                        />
                      </label>
                    </div>
                    <div className="md:col-span-3">
                      <button
                        type="button"
                        onClick={handleAddPhotoItem}
                        className="w-full px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Add Photo
                      </button>
                    </div>

                    <div className="md:col-span-12">
                      <input
                        type="text"
                        placeholder="Optional caption (e.g. Science fair exhibition model by Class IX)"
                        value={newItemCaption}
                        onChange={(e) => setNewItemCaption(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* List of Current Photos */}
                {formData.items.length === 0 ? (
                  <p className="text-stone-400 text-xs italic text-center py-4">
                    No photos added to this album yet. Upload or enter URLs above.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {formData.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
                      >
                        <img src={it.mediaUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemovePhotoItem(idx)}
                            className="self-end bg-red-600 text-white p-1 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span className="text-[10px] text-white font-mono truncate px-1">
                            {it.caption || `#${idx + 1}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-5 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-mono font-bold uppercase tracking-wider hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-[#111b5e] hover:bg-[#0b132b] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saveMutation.isPending ? 'Saving Album...' : 'Save & Publish Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagerPage;
