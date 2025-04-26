
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface AddBookFormProps {
  onSubmit: (bookData: any) => void;
  onCancel: () => void;
}

const AddBookForm: React.FC<AddBookFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setErrors({...errors, image: 'Image size should be less than 1MB'});
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCoverImage(base64String);
      setPreviewImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!dailyPrice.trim()) {
      newErrors.dailyPrice = 'Daily price is required';
    } else if (isNaN(parseFloat(dailyPrice)) || parseFloat(dailyPrice) <= 0) {
      newErrors.dailyPrice = 'Daily price must be a positive number';
    }
    if (!deposit.trim()) {
      newErrors.deposit = 'Deposit is required';
    } else if (isNaN(parseFloat(deposit)) || parseFloat(deposit) <= 0) {
      newErrors.deposit = 'Deposit must be a positive number';
    }
    if (!coverImage) newErrors.image = 'Cover image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        title,
        description,
        dailyPrice,
        deposit,
        "coverImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-blue-100/10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">List a New Book</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Book Title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Book Description"
              rows={4}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="dailyPrice">
              Daily Price (ETH)
            </label>
            <input
              type="text"
              id="dailyPrice"
              value={dailyPrice}
              onChange={(e) => setDailyPrice(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dailyPrice ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.01"
            />
            {errors.dailyPrice && <p className="text-red-500 text-sm mt-1">{errors.dailyPrice}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="deposit">
              Deposit (ETH)
            </label>
            <input
              type="text"
              id="deposit"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.deposit ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.1"
            />
            {errors.deposit && <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2">
              Cover Image
            </label>
            {previewImage ? (
              <div className="relative mb-4">
                <img 
                  src={previewImage} 
                  alt="Cover Preview" 
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-300" 
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setPreviewImage('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="coverImage"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload size={48} className="text-gray-400 mb-2" />
                  <span className="text-gray-500">Click to upload cover image</span>
                  <span className="text-gray-400 text-sm mt-1">JPG, PNG, GIF up to 1MB</span>
                </label>
              </div>
            )}
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            List Book
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;
