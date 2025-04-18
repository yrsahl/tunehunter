import { createContext, ReactNode, useContext, useState } from "react";

interface VendorData {
  amazon: any;
  apple: any;
  beatport: any;
  bandcamp: any;
}

interface ISearchDataContext {
  vendorData: VendorData | null;
  requestVendorData: (searchId: string, accessToken: string) => void;
  isVendorDataLoading: boolean;
}

const VendorDataContext = createContext<ISearchDataContext>({
  vendorData: null,
  requestVendorData: () => {},
  isVendorDataLoading: false,
});

export const useVendorDataContext = () => useContext(VendorDataContext);

export const VendorDataProvider = ({ children }: { children: ReactNode }) => {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isVendorDataLoading, setIsSearchDataLoading] = useState(false);
  // const storeQueryResults = api.song.storeQueryResults.useMutation();

  // Request new Search Data
  const requestVendorData = () => {
    // Query api
    setIsSearchDataLoading(true);
    try {
    } catch (error) {
      console.error(error);
      setIsSearchDataLoading(false);
    }
  };

  return (
    <VendorDataContext.Provider
      value={{
        vendorData,
        isVendorDataLoading,
        requestVendorData,
      }}
    >
      {children}
    </VendorDataContext.Provider>
  );
};
