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
        coverImage,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#181824]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-cyan-500/10 p-8">
      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 tracking-tight">
        List a New Book
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column */}
          <div>
            <label htmlFor="title" className="block text-cyan-200 font-semibold mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-[#232946]/80 border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-cyan-100 placeholder-cyan-400 transition ${
                errors.title ? 'border-pink-500' : 'border-cyan-800/30'
              }`}
              placeholder="Book Title"
              autoComplete="off"
            />
            {errors.title && <p className="text-pink-400 text-sm mt-1">{errors.title}</p>}
          </div>
          {/* Right column */}
          <div>
            <label htmlFor="dailyPrice" className="block text-cyan-200 font-semibold mb-2">
              Daily Price (ETH)
            </label>
            <input
              type="text"
              id="dailyPrice"
              value={dailyPrice}
              onChange={(e) => setDailyPrice(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-[#232946]/80 border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-cyan-100 placeholder-cyan-400 transition ${
                errors.dailyPrice ? 'border-pink-500' : 'border-cyan-800/30'
              }`}
              placeholder="0.01"
              autoComplete="off"
            />
            {errors.dailyPrice && <p className="text-pink-400 text-sm mt-1">{errors.dailyPrice}</p>}
          </div>
          {/* Left column */}
          <div>
            <label htmlFor="deposit" className="block text-cyan-200 font-semibold mb-2">
              Deposit (ETH)
            </label>
            <input
              type="text"
              id="deposit"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-[#232946]/80 border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-cyan-100 placeholder-cyan-400 transition ${
                errors.deposit ? 'border-pink-500' : 'border-cyan-800/30'
              }`}
              placeholder="0.1"
              autoComplete="off"
            />
            {errors.deposit && <p className="text-pink-400 text-sm mt-1">{errors.deposit}</p>}
          </div>
          {/* Right column */}
          <div>
            <label htmlFor="description" className="block text-cyan-200 font-semibold mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-[#232946]/80 border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-cyan-100 placeholder-cyan-400 transition ${
                errors.description ? 'border-pink-500' : 'border-cyan-800/30'
              }`}
              placeholder="Book Description"
              rows={4}
            />
            {errors.description && <p className="text-pink-400 text-sm mt-1">{errors.description}</p>}
          </div>
          {/* Full width for image upload */}
          <div className="md:col-span-2">
            <label className="block text-cyan-200 font-semibold mb-2">
              Cover Image
            </label>
            {previewImage ? (
              <div className="relative mb-4">
                <img 
                  src={previewImage} 
                  alt="Cover Preview" 
                  className="w-full max-h-64 object-contain rounded-xl border border-cyan-800/30 shadow-lg" 
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setPreviewImage('');
                  }}
                  className="absolute top-2 right-2 bg-pink-500 text-white p-1 rounded-full hover:bg-pink-600 shadow"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-cyan-800/30 rounded-xl p-8 text-center bg-[#232946]/40 hover:bg-[#232946]/60 transition">
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
                  <Upload size={48} className="text-cyan-400 mb-2" />
                  <span className="text-cyan-300 font-medium">Click to upload cover image</span>
                  <span className="text-cyan-500 text-sm mt-1">JPG, PNG, GIF up to 1MB</span>
                </label>
              </div>
            )}
            {errors.image && <p className="text-pink-400 text-sm mt-1">{errors.image}</p>}
          </div>
        </div>
        <div className="flex justify-end mt-8 space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-900 to-blue-900 text-cyan-200 font-semibold hover:from-cyan-800 hover:to-blue-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-600 hover:to-blue-600 transition"
          >
            List Book
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBookForm;
