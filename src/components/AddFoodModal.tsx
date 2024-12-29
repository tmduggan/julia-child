import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { addFood } from '../services/database';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: () => void;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onFoodAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    fat: '',
    carbs: '',
    protein: '',
    servingSize: '100',
    servingUnit: 'g',
    cholesterol: '',
    sodium: '',
    potassium: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addFood({
        ...formData,
        calories: Number(formData.calories),
        fat: Number(formData.fat),
        carbs: Number(formData.carbs),
        protein: Number(formData.protein),
        servingSize: Number(formData.servingSize),
        cholesterol: formData.cholesterol ? Number(formData.cholesterol) : undefined,
        sodium: formData.sodium ? Number(formData.sodium) : undefined,
        potassium: formData.potassium ? Number(formData.potassium) : undefined,
        isCustom: true,
      });

      onFoodAdded();
      setFormData({
        name: '',
        calories: '',
        fat: '',
        carbs: '',
        protein: '',
        servingSize: '100',
        servingUnit: 'g',
        cholesterol: '',
        sodium: '',
        potassium: '',
      });
    } catch (error) {
      console.error('Error adding food:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Add Custom Food
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Food Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Calories *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.calories}
                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Fat (g) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.1"
                        value={formData.fat}
                        onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Carbs (g) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.1"
                        value={formData.carbs}
                        onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Protein (g) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.1"
                        value={formData.protein}
                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Serving Size
                      </label>
                      <input
                        type="number"
                        value={formData.servingSize}
                        onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Unit
                      </label>
                      <select
                        value={formData.servingUnit}
                        onChange={(e) => setFormData({ ...formData, servingUnit: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="g">grams (g)</option>
                        <option value="ml">milliliters (ml)</option>
                        <option value="oz">ounces (oz)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Cholesterol (mg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.cholesterol}
                        onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sodium (mg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.sodium}
                        onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Potassium (mg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.potassium}
                        onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Add Food
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddFoodModal;
