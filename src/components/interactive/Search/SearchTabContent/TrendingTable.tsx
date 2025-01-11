type TrendingTabContentProps = {
  data: any; //api.song.getTrending.useQuery;
};

const TrendingTable = ({ data }: TrendingTabContentProps) => {
  return (
    <table className="w-full">
      {
        // <tr className="max-h-16">
        //   <td className="py-2 pr-8">
        //     <div className="avatar">
        //       <div className="mask mask-squircle h-12 w-12">
        //         <img src={track.albumArtUrl} />
        //       </div>
        //     </div>
        //   </td>
        //   <td className="max-h-16 overflow-hidden pr-4">
        //     <p>{artists[0]}</p>
        //     {artists[1] && (
        //       <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
        //         {track.artists[1]}
        //       </p>
        //     )}
        //   </td>
        //   <td className="pr-4">
        //     <span>{track.title}</span>
        //   </td>
        //   <td className="text-right">
        //     <IconButton variant="primary" text="Search" size="sm" />
        //   </td>
        // </tr>
      }
    </table>
  );
};

export default TrendingTable;
