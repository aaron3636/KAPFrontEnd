import React, { useState, useEffect } from "react";
import { fhirR4 } from "@smile-cdr/fhirts";
import BundleEntry from "../Utils/BundleEntry";
import { useAuth0 } from "@auth0/auth0-react";
import { filterResources, sortResources } from "../Utils/utils";
import Banner from "../elements/Banner";

const ObservationAll: React.FC = () => {
  // State variables
  const { getAccessTokenSilently } = useAuth0();
  const [observations, setObservations] = useState<fhirR4.Observation[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterAttribute, setFilterAttribute] = useState("code");
  const [sortAttribute, setSortAttribute] = useState("date");
  const [observationsPerPage, setObservationsPerPage] = useState(20);
  const [offsetObservationsPerPage, setoffsetObservationsPerPage] = useState(0);

  // Fetch observations when the component mounts
  useEffect(() => {
    fetchObservations();
  }, [observationsPerPage, offsetObservationsPerPage, getAccessTokenSilently]);

  // Fetch observations from the Server
  const fetchObservations = async () => {
    const token = await getAccessTokenSilently();
    try {
      const response = await fetch(
        "http://localhost:8080/fhir/Observation?_count=" +
          observationsPerPage +
          "&_offset=" +
          offsetObservationsPerPage,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ); // Replace with your API endpoint

      const data = await response.json();
      // Extract the resource property from the Bundle entry
      if ("entry" in data) {
        const observationsData = data.entry.map(
          (entry: BundleEntry) => entry.resource
        );
        // Store the extracted observations in state
        setObservations(observationsData);
      } else {
        //TODO : What should happen if we have reached the limit. Some warning?
      }
    } catch (error) {
      console.error("Error fetching observations:", error);
    }
  };

  // Filter observations based on the selected attribute and search text
  const filterAndSortObservations = () => {
    const filteredObservations = filterResources(
      observations,
      filterAttribute,
      searchText
    );
    const sortedObservations = sortResources(
      filteredObservations,
      sortAttribute
    );
    return sortedObservations;
  };

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  // Handle attributes selection change
  const handleFilterAttributeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFilterAttribute(event.target.value);
  };

  const handleSortAttributeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSortAttribute(event.target.value);
  };

  // Refresh the observation data by fetching observations again
  const handleRefresh = () => {
    fetchObservations(); // Fetch observations again to refresh the data
  };

  const handleObservationsPerPageChange = (value: string) => {
    const parsedValue = parseInt(value, 10);
    setObservationsPerPage(parsedValue);
  };

  const handleOffsetObservationPerPageChange = (value: number) => {
    if (value < 0) {
      value = 0;
    }
    setoffsetObservationsPerPage(value);
  };

  return (
    <div>
      <Banner>What are you looking for?</Banner>
      // Here you would have your table and cells with observation data...
    </div>
  );
};

export default ObservationAll;
