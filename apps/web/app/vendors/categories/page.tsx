"use client"

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical,
  FolderTree,
  Package,
  Truck,
  Wrench,
  Building2,
  Users,
  Briefcase,
  HardHat,
  PenTool,
  Shield,
  ChevronRight,
  X,
  Save,
  Eye,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string | null
  vendorCount: number
  color: string
  icon: string
  createdAt: string
}

const iconMap: Record<string, any> = {
  Package, HardHat, Wrench, Briefcase, Building2, Users, Truck, PenTool, Shield, FolderTree
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  
  // Form state
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: 'blue',
    icon: 'Package'
  })

  const [editCategory, setEditCategory] = useState({
    name: '',
    description: '',
    color: 'blue',
    icon: 'Package'
  })

  const colors = [
    { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', hover: 'hover:bg-blue-200' },
    { name: 'green', bg: 'bg-green-100', text: 'text-green-600', hover: 'hover:bg-green-200' },
    { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-600', hover: 'hover:bg-purple-200' },
    { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-600', hover: 'hover:bg-orange-200' },
    { name: 'red', bg: 'bg-red-100', text: 'text-red-600', hover: 'hover:bg-red-200' },
    { name: 'indigo', bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'hover:bg-indigo-200' },
    { name: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-600', hover: 'hover:bg-yellow-200' },
    { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-600', hover: 'hover:bg-pink-200' }
  ]

  const icons = [
    { name: 'Package', icon: Package },
    { name: 'HardHat', icon: HardHat },
    { name: 'Wrench', icon: Wrench },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Building2', icon: Building2 },
    { name: 'Users', icon: Users },
    { name: 'Truck', icon: Truck },
    { name: 'PenTool', icon: PenTool },
    { name: 'Shield', icon: Shield },
    { name: 'FolderTree', icon: FolderTree }
  ]

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.getCategories()
      if (response.success) {
        setCategories(response.data)
      } else {
        setError('Failed to load categories')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const getColorClasses = (color: string) => {
    return colors.find(c => c.name === color) || colors[0]
  }

  // Add Category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      const response = await api.createCategory({
        name: newCategory.name,
        description: newCategory.description || `${newCategory.name} vendors`,
        color: newCategory.color,
        icon: newCategory.icon
      })

      if (response.success) {
        setCategories([...categories, response.data])
        setNewCategory({ name: '', description: '', color: 'blue', icon: 'Package' })
        setIsAddModalOpen(false)
      } else {
        alert(response.error || 'Failed to create category')
      }
    } catch (err) {
      console.error('Error creating category:', err)
      alert('Failed to create category')
    }
  }

  // Edit Category - Open modal with current data
  const handleEditClick = (category: Category) => {
    setSelectedCategory(category)
    setEditCategory({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon
    })
    setIsEditModalOpen(true)
    setActiveMenuId(null)
  }

  // Edit Category - Save changes
  const handleEditSave = async () => {
    if (!selectedCategory) return
    if (!editCategory.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      const response = await api.updateCategory(selectedCategory.id, {
        name: editCategory.name,
        description: editCategory.description || `${editCategory.name} vendors`,
        color: editCategory.color,
        icon: editCategory.icon
      })

      if (response.success) {
        setCategories(categories.map(cat => 
          cat.id === selectedCategory.id ? response.data : cat
        ))
        setIsEditModalOpen(false)
        setSelectedCategory(null)
      } else {
        alert(response.error || 'Failed to update category')
      }
    } catch (err) {
      console.error('Error updating category:', err)
      alert('Failed to update category')
    }
  }

  // Delete Category - Open confirmation
  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
    setActiveMenuId(null)
  }

  // Delete Category - Confirm delete
  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return

    try {
      const response = await api.deleteCategory(selectedCategory.id)

      if (response.success) {
        setCategories(categories.filter(cat => cat.id !== selectedCategory.id))
        setIsDeleteModalOpen(false)
        setSelectedCategory(null)
      } else {
        alert(response.error || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Error deleting category:', err)
      alert('Failed to delete category')
    }
  }

  // View vendors in this category
  const handleViewCategory = (category: Category) => {
    router.push(`/vendors?category=${encodeURIComponent(category.name)}`)
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span>Vendors</span>
            <ChevronRight size={14} />
            <span className="text-gray-900">Categories</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Categories</h1>
          <p className="text-gray-600 mt-1">Organize vendors by category for better management</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCategories}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6">Create your first category to organize vendors.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Create First Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const colors = getColorClasses(category.color)
            const Icon = iconMap[category.icon] || Package
            
            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition relative group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${colors.bg} rounded-lg ${colors.text}`}>
                    <Icon size={24} />
                  </div>
                  
                  {/* Three Dots Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === category.id ? null : category.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {activeMenuId === category.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                          <button
                            onClick={() => handleEditClick(category)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Edit2 size={14} />
                            <span>Edit Category</span>
                          </button>
                          <button
                            onClick={() => handleViewCategory(category)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Eye size={14} />
                            <span>View Vendors</span>
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 size={14} />
                            <span>Delete Category</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {category.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {category.vendorCount} {category.vendorCount === 1 ? 'vendor' : 'vendors'}
                  </span>
                  <button 
                    onClick={() => handleViewCategory(category)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add Category Card */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer flex flex-col items-center justify-center text-center group"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-blue-200 mb-3">
              <Plus className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Add New Category</h3>
            <p className="text-sm text-gray-500">Create a new vendor category</p>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsAddModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderTree className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
                    <p className="text-sm text-gray-600">Create a category to organize vendors</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., Electrical Suppliers"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                      placeholder="Describe what kind of vendors belong in this category..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setNewCategory({ ...newCategory, color: color.name })}
                          className={`w-8 h-8 rounded-full ${color.bg} ${
                            newCategory.color === color.name 
                              ? 'ring-2 ring-offset-2 ring-blue-500' 
                              : ''
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Icon
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {icons.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setNewCategory({ ...newCategory, icon: icon.name })}
                          className={`p-2 rounded-lg ${
                            newCategory.icon === icon.name 
                              ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={icon.name}
                        >
                          <icon.icon size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Category</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsEditModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Edit2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Edit Category</h2>
                    <p className="text-sm text-gray-600">Update category information</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editCategory.name}
                      onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editCategory.description}
                      onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                      placeholder="Category description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setEditCategory({ ...editCategory, color: color.name })}
                          className={`w-8 h-8 rounded-full ${color.bg} ${
                            editCategory.color === color.name 
                              ? 'ring-2 ring-offset-2 ring-blue-500' 
                              : ''
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Icon
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {icons.map((icon) => (
                        <button
                          key={icon.name}
                          type="button"
                          onClick={() => setEditCategory({ ...editCategory, icon: icon.name })}
                          className={`p-2 rounded-lg ${
                            editCategory.icon === icon.name 
                              ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={icon.name}
                        >
                          <icon.icon size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Delete Category</h2>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete <span className="font-semibold">{selectedCategory.name}</span>?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  This action cannot be undone.
                </p>
                
                {selectedCategory.vendorCount > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-yellow-800">
                          Cannot delete category with vendors
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          This category has {selectedCategory.vendorCount} vendors. 
                          Please reassign or delete them first.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={selectedCategory.vendorCount > 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete Category</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
