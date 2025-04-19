import IconButton from "@/components/IconButton";
import { CountryCode, countryNamesEnglish } from "@/helpers/region";
import { VendorDataResponse } from "@/schemas";
import SearchResultsRowSkeleton from "./SearchResultsRowSkeleton";

interface ISearchResultsRowProps {
  store: string;
  region: CountryCode;
  data: VendorDataResponse | undefined;
  isLoading: boolean;
}

export default function SearchResultsRow({
  store,
  region,
  data,
  isLoading,
}: ISearchResultsRowProps) {
  // Skeleton
  if (isLoading) return <SearchResultsRowSkeleton store={store} region={region} />;

  return (
    <tr>
      {/* Store */}
      <td>
        <div className="flex items-center space-x-5">
          <div className="avatar ">
            <div className="mask mask-squircle h-12 w-12">
              <img src={`logos/${store.toLowerCase()}.svg`} alt="Avatar Tailwind CSS Component" />
            </div>
          </div>
          <div className="hidden">
            <div className="font-bold">{store}</div>
            <div className="text-sm font-normal opacity-50">
              {countryNamesEnglish[region.toUpperCase()]}
            </div>
          </div>
        </div>
      </td>

      {data ? (
        <>
          {/* Quality */}
          <td className="flex flex-col justify-center">
            <span>{data?.fileFormat}</span>
            <span className="text-sm opacity-50">{data?.quality}</span>
          </td>

          {/* Price */}
          <td>
            <div className="flex items-center gap-4">
              <div className="inline-block">
                {data?.price}
                {data?.currency}
              </div>
              <div className="flex flex-1 justify-center">
                <a href="{vendorData.song.songLink}" target="_blank">
                  <button className="btn btn-secondary btn-ghost text-base normal-case">
                    {/* <FaExternalLinkSquareAlt size={32} className="text-secondary" /> */}
                  </button>
                </a>
              </div>
            </div>
          </td>

          {/* Artist's share */}
          <td>
            <div className="flex flex-col gap-1">
              <div className="h-2 w-[80%] rounded-full bg-primary/20">
                {data?.artistsShare && (
                  <div
                    className="h-2 rounded-full bg-success"
                    style={{ width: `${data?.artistsShare * 100}%` }}
                  />
                )}
              </div>
            </div>
          </td>

          {/* Link */}
          <td>
            <IconButton
              size="icon"
              variant="ghost"
              icon="externalArrow"
              iconSize="24px"
              className="border-none"
            />
          </td>
        </>
      ) : (
        <td colSpan={4} className="text-center text-base text-muted-foreground">
          Not available in this store.
        </td>
      )}
    </tr>
  );
}
