import { CountryCode } from "@/helpers/region";
import { VendorDataResponse } from "@/schemas";
import VendorResultsRow from "./VendorResultsRow";
import VendorResultsRowMessage from "./VendorResultsRowMessage";
import VendorResultsRowSkeleton from "./VendorResultsRowSkeleton";

interface SearchResultsVendorRowsProps {
  store: string;
  region: CountryCode;
  vendorData: VendorDataResponse | undefined;
  isLoading: boolean;
}

const VendorResults = ({ store, region, vendorData, isLoading }: SearchResultsVendorRowsProps) => {
  // Skeleton
  if (isLoading) return <VendorResultsRowSkeleton store={store} region={region} />;

  // No data
  if (!vendorData || vendorData.error) {
    return (
      <VendorResultsRowMessage
        message="Not available in this store."
        store={store}
        region={region}
      />
    );
  }

  if (vendorData.data) {
    return (
      <>
        {vendorData.data.tracks.map((track) => (
          <VendorResultsRow
            key={track.trackData.url}
            track={track}
            vendor={vendorData.data.vendor}
          />
        ))}
      </>
    );
  }
};

export default VendorResults;
