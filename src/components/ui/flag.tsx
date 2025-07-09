import ReactCountryFlag from "react-country-flag"
import { allCountries } from "country-region-data"


function Flag({ countryName }: { countryName: string }) {
    const countryData = allCountries.find((countryData) => countryData[0].toLowerCase() == countryName.toLowerCase())
    
    let countryCode = countryData ? countryData[1] : "XX"
    if(countryName == "USA") countryCode = "US"; // Edge case for U.S FTC teams


    return (
        <span className="ml-4">
            <ReactCountryFlag countryCode={countryCode} svg aria-label={countryName} style={{width: '3em', height: '3em', borderRadius: '0.7em'}}/>
        </span>
    );
}

export default Flag;