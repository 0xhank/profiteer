import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormData {
  name: string;
  symbol: string;
  image: string;
}

interface FormDataContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export const FormDataProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>({
    name: 'sohan',
    symbol: 'sohan',
    image: 'https://pbs.twimg.com/profile_images/1595100750086037504/mJ9n2fqC_400x400.jpg',
  });

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
};