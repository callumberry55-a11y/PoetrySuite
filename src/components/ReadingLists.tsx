import { useState, useEffect } from 'react';
import { BookMarked, Plus, Search, Lock, Globe, Trash2, Edit2, X, GripVertical, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ReadingList {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  poem_count?: number;
}

interface ReadingListItem {
  id: string;
  reading_list_id: string;
  poem_id: string;
  position: number;
  created_at: string;
  poem?: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  };
}

interface Poem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function ReadingLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [selectedList, setSelectedList] = useState<ReadingList | null>(null);
  const [listItems, setListItems] = useState<ReadingListItem[]>([]);
  const [availablePoems, setAvailablePoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPoemsModal, setShowAddPoemsModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [newListPublic, setNewListPublic] = useState(false);
  const [editingList, setEditingList] = useState<ReadingList | null>(null);

  useEffect(() => {
    loadReadingLists();
  }, [user?.id]);

  useEffect(() => {
    if (selectedList) {
      loadListItems(selectedList.id);
    }
  }, [selectedList]);

  const loadReadingLists = async () => {
    if (!user?.id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('reading_lists')
      .select(`
        *,
        reading_list_items (count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const listsWithCount = data.map(list => ({
        ...list,
        poem_count: list.reading_list_items?.[0]?.count || 0
      }));
      setLists(listsWithCount);
    }
    setLoading(false);
  };

  const loadListItems = async (listId: string) => {
    const { data, error } = await supabase
      .from('reading_list_items')
      .select(`
        *,
        poem:poems (
          id,
          title,
          content,
          created_at
        )
      `)
      .eq('reading_list_id', listId)
      .order('position', { ascending: true });

    if (!error && data) {
      setListItems(data as ReadingListItem[]);
    }
  };

  const loadAvailablePoems = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('poems')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAvailablePoems(data);
    }
  };

  const createList = async () => {
    if (!user?.id || !newListName.trim()) return;

    const { error } = await supabase
      .from('reading_lists')
      .insert({
        user_id: user.id,
        name: newListName.trim(),
        description: newListDescription.trim(),
        is_public: newListPublic
      });

    if (!error) {
      setNewListName('');
      setNewListDescription('');
      setNewListPublic(false);
      setShowCreateModal(false);
      loadReadingLists();
    }
  };

  const updateList = async () => {
    if (!editingList) return;

    const { error } = await supabase
      .from('reading_lists')
      .update({
        name: editingList.name,
        description: editingList.description,
        is_public: editingList.is_public
      })
      .eq('id', editingList.id);

    if (!error) {
      setShowEditModal(false);
      setEditingList(null);
      loadReadingLists();
      if (selectedList?.id === editingList.id) {
        setSelectedList(editingList);
      }
    }
  };

  const deleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this reading list?')) return;

    const { error } = await supabase
      .from('reading_lists')
      .delete()
      .eq('id', listId);

    if (!error) {
      if (selectedList?.id === listId) {
        setSelectedList(null);
      }
      loadReadingLists();
    }
  };

  const addPoemToList = async (poemId: string) => {
    if (!selectedList) return;

    const maxPosition = listItems.reduce((max, item) => Math.max(max, item.position), -1);

    const { error } = await supabase
      .from('reading_list_items')
      .insert({
        reading_list_id: selectedList.id,
        poem_id: poemId,
        position: maxPosition + 1
      });

    if (!error) {
      loadListItems(selectedList.id);
      loadReadingLists();
    }
  };

  const removePoemFromList = async (itemId: string) => {
    const { error } = await supabase
      .from('reading_list_items')
      .delete()
      .eq('id', itemId);

    if (!error && selectedList) {
      loadListItems(selectedList.id);
      loadReadingLists();
    }
  };

  const openAddPoemsModal = () => {
    loadAvailablePoems();
    setShowAddPoemsModal(true);
  };

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availablePoemsFiltered = availablePoems.filter(
    poem => !listItems.some(item => item.poem_id === poem.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-surface border-b border-outline/20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <BookMarked className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
                  Reading Lists
                </h1>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {lists.length} {lists.length === 1 ? 'list' : 'lists'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">New List</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              type="text"
              placeholder="Search reading lists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-variant/30 border border-outline/20 rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-4 sm:p-6">
          {selectedList ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setSelectedList(null)}
                    className="p-2 hover:bg-surface-variant/50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X size={20} className="text-on-surface-variant" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-on-surface truncate">
                        {selectedList.name}
                      </h2>
                      {selectedList.is_public ? (
                        <Globe size={16} className="text-primary flex-shrink-0" />
                      ) : (
                        <Lock size={16} className="text-on-surface-variant flex-shrink-0" />
                      )}
                    </div>
                    {selectedList.description && (
                      <p className="text-sm text-on-surface-variant line-clamp-1">
                        {selectedList.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={openAddPoemsModal}
                    className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add Poems</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingList(selectedList);
                      setShowEditModal(true);
                    }}
                    className="p-2 hover:bg-surface-variant/50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} className="text-on-surface-variant" />
                  </button>
                  <button
                    onClick={() => deleteList(selectedList.id)}
                    className="p-2 hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} className="text-error" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {listItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <BookOpen className="w-16 h-16 text-on-surface-variant/30 mb-4" />
                    <p className="text-on-surface-variant text-lg mb-2">No poems yet</p>
                    <p className="text-sm text-on-surface-variant/70 mb-4">
                      Add poems to start building your reading list
                    </p>
                    <button
                      onClick={openAddPoemsModal}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Add Poems
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="bg-surface border border-outline/20 rounded-xl p-4 hover:border-primary/30 transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <GripVertical size={18} className="text-on-surface-variant/40" />
                            <span className="text-sm font-semibold text-on-surface-variant/60 w-6">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-on-surface mb-1 line-clamp-1">
                              {item.poem?.title || 'Untitled'}
                            </h3>
                            <p className="text-sm text-on-surface-variant line-clamp-2">
                              {item.poem?.content || 'No content'}
                            </p>
                          </div>
                          <button
                            onClick={() => removePoemFromList(item.id)}
                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-error/10 rounded-lg transition-all flex-shrink-0"
                          >
                            <Trash2 size={16} className="text-error" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {filteredLists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <BookMarked className="w-16 h-16 text-on-surface-variant/30 mb-4" />
                  <p className="text-on-surface-variant text-lg mb-2">
                    {searchTerm ? 'No lists found' : 'No reading lists yet'}
                  </p>
                  <p className="text-sm text-on-surface-variant/70 mb-4">
                    {searchTerm
                      ? 'Try a different search term'
                      : 'Create your first reading list to organize your favorite poems'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Create Reading List
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLists.map(list => (
                    <div
                      key={list.id}
                      className="bg-surface border border-outline/20 rounded-xl p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                      onClick={() => setSelectedList(list)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <BookMarked size={20} className="text-primary flex-shrink-0" />
                          <h3 className="font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                            {list.name}
                          </h3>
                        </div>
                        {list.is_public ? (
                          <Globe size={16} className="text-primary flex-shrink-0" />
                        ) : (
                          <Lock size={16} className="text-on-surface-variant flex-shrink-0" />
                        )}
                      </div>

                      {list.description && (
                        <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">
                          {list.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-outline/10">
                        <span className="text-xs text-on-surface-variant">
                          {list.poem_count || 0} {list.poem_count === 1 ? 'poem' : 'poems'}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingList(list);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 hover:bg-surface-variant/50 rounded transition-colors"
                          >
                            <Edit2 size={14} className="text-on-surface-variant" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteList(list.id);
                            }}
                            className="p-1.5 hover:bg-error/10 rounded transition-colors"
                          >
                            <Trash2 size={14} className="text-error" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6 slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-on-surface">Create Reading List</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-surface-variant/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Summer Poetry, Love Poems..."
                  className="w-full px-4 py-2.5 bg-surface-variant/30 border border-outline/20 rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="What's this list about?"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-surface-variant/30 border border-outline/20 rounded-xl text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface-variant/20 rounded-xl">
                <input
                  type="checkbox"
                  id="public-list"
                  checked={newListPublic}
                  onChange={(e) => setNewListPublic(e.target.checked)}
                  className="w-5 h-5 rounded border-outline/30 text-primary focus:ring-2 focus:ring-primary/50"
                />
                <label htmlFor="public-list" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    {newListPublic ? <Globe size={16} /> : <Lock size={16} />}
                    <span>Make this list {newListPublic ? 'public' : 'private'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {newListPublic
                      ? 'Anyone can view this list'
                      : 'Only you can see this list'}
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 bg-surface-variant/50 text-on-surface rounded-xl hover:bg-surface-variant transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createList}
                disabled={!newListName.trim()}
                className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6 slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-on-surface">Edit Reading List</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingList(null);
                }}
                className="p-2 hover:bg-surface-variant/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={editingList.name}
                  onChange={(e) => setEditingList({ ...editingList, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-variant/30 border border-outline/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={editingList.description}
                  onChange={(e) => setEditingList({ ...editingList, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-surface-variant/30 border border-outline/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-surface-variant/20 rounded-xl">
                <input
                  type="checkbox"
                  id="edit-public-list"
                  checked={editingList.is_public}
                  onChange={(e) => setEditingList({ ...editingList, is_public: e.target.checked })}
                  className="w-5 h-5 rounded border-outline/30 text-primary focus:ring-2 focus:ring-primary/50"
                />
                <label htmlFor="edit-public-list" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    {editingList.is_public ? <Globe size={16} /> : <Lock size={16} />}
                    <span>Make this list {editingList.is_public ? 'public' : 'private'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {editingList.is_public
                      ? 'Anyone can view this list'
                      : 'Only you can see this list'}
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingList(null);
                }}
                className="flex-1 px-4 py-2.5 bg-surface-variant/50 text-on-surface rounded-xl hover:bg-surface-variant transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={updateList}
                disabled={!editingList.name.trim()}
                className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddPoemsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col slide-up">
            <div className="flex items-center justify-between p-6 border-b border-outline/20">
              <h2 className="text-2xl font-bold text-on-surface">Add Poems</h2>
              <button
                onClick={() => setShowAddPoemsModal(false)}
                className="p-2 hover:bg-surface-variant/50 rounded-lg transition-colors"
              >
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {availablePoemsFiltered.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
                  <p className="text-on-surface-variant">
                    {availablePoems.length === 0
                      ? 'No poems available. Create some poems first!'
                      : 'All your poems are already in this list!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availablePoemsFiltered.map(poem => (
                    <div
                      key={poem.id}
                      className="bg-surface-variant/30 border border-outline/20 rounded-xl p-4 hover:border-primary/30 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-on-surface mb-1 line-clamp-1">
                            {poem.title}
                          </h3>
                          <p className="text-sm text-on-surface-variant line-clamp-2">
                            {poem.content}
                          </p>
                        </div>
                        <button
                          onClick={() => addPoemToList(poem.id)}
                          className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-on-primary transition-all text-sm font-medium flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-outline/20">
              <button
                onClick={() => setShowAddPoemsModal(false)}
                className="w-full px-4 py-2.5 bg-surface-variant/50 text-on-surface rounded-xl hover:bg-surface-variant transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
