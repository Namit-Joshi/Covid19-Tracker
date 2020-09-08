import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from "./Map";
import './App.css';
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]); 
  const [casesType, setCasesType] = useState("cases"); 

  // STATE = How to write a variable in REACT
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []);
  // https://disease.sh/v3/covid-19/countries

  // USEEFFECT = Runs a piece of code
  // based on a given condition
  
  useEffect(() => {
    // useEffect -> runs code only 1 time when the component loads
    // async -> send a request, wait for it, do something with it
    const getCountriesData = async() => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url =
      countryCode === 'worldwide' 
      ? "https://disease.sh/v3/covid-19/all"
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)  
    .then(response => response.json())
    .then((data) => {
      setCountry(countryCode);
      setCountryInfo(data);

      if(countryCode !== "worldwide"){        
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        console.log(mapCenter);
        setMapZoom(4);
      }
      else{
        console.log(mapCenter);
        setMapCenter({lat: 34.80746, lng: -40.4796});
        setMapZoom(3);
      }
    })
  };

  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
      <h1>COVID 19 TRACKER</h1>
      <FormControl className="app__dropdown">
        <Select variant="outlined" onChange={onCountryChange} value={country}>

          {/* Loop through all the countries and show a drop
           down list of the options */}
          <MenuItem value="worldwide">Worldwide</MenuItem>
          {countries.map((country) => (
           <MenuItem value={country.value}>{country.name}</MenuItem>
          ))}
              
        </Select>
      </FormControl>
      </div>

      <div className="app__stats">
        <InfoBox 
          active={casesType === "cases"}
          onClick={(e) => setCasesType("cases")}
          title="CoronaVirus Cases"
          isRed
          cases={prettyPrintStat(countryInfo.todayCases)}
          total={prettyPrintStat(countryInfo.cases)}
        />

        <InfoBox 
          active={casesType === "recovered"}
          onClick={(e) => setCasesType("recovered")}
          title="Recovered" 
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={prettyPrintStat(countryInfo.recovered)}
        />

        <InfoBox 
          active={casesType === "deaths"}
          onClick={(e) => setCasesType("deaths")}
          title="Deaths" 
          isRed
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={prettyPrintStat(countryInfo.deaths)}
        />
      </div>

      {/* Map */}
      
      <Map
      casesType={casesType}
      countries={mapCountries}
      center={mapCenter}
      zoom={mapZoom}
      />
      </div>

      <Card className="app__right"> 
        <CardContent>
          <h3>Live Cases by Country</h3>
          {/* Table */}
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide New {casesType} </h3>
          <LineGraph className="app__graph" casesType={casesType} />
          {/* Graph */}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
