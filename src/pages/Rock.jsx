import rockCover from "../assets/images/rockCover.png";
import DataTable from "react-data-table-component";


export const Rock = () => {

  const columns = [
    {
      name: "Title",
      selector: row => row.title
    },
    {
      name: "Artist",
      selector: row => row.artist
    },
    {
      name: "Duration",
      selector: row => row.duration
    },
  ]

  const data = [
    {
      title: "blabla",
      artist: "blibli",
      duration: 132
    },
    {
      title: "fawef",
      artist: "blibawefali",
      duration: 141
    },
    {
      title: "awfae",
      artist: "blibagfaewgli",
      duration: 142
    },
  ]

  const customStyles = {
    headCells: {
      style: {
        fontWeight: 'bold'
      }
    }
  }
  return (
    <>
    
    <div className="bg-gradient-to-b from-[#3da9f2] to-[#165a9e] w-full h-[200px] p-6 rounded-lg flex items-end">
      <h2 className="text-5xl">Rock</h2>
    </div>

    <div>
      <DataTable 
        columns={columns}
        data={data}
        customStyles={customStyles}
      
      />
    </div>
    
    </>
  )
}
