import React, { useState, useEffect } from 'react';
import { fhirR4 } from '@smile-cdr/fhirts';


// Assuming you have defined appropriate types for Identifier, HumanName, Address, and Contact

interface BundleEntry {
    resource: fhirR4.Patient;
    // Define other properties of the Bundle entry if needed
  }

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<fhirR4.Patient[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchPatients(); // Fetch patients when the component mounts
  }, []);

  const fetchPatients = async () => {
    try {
        const response = await fetch('http://localhost:8080/fhir/Patient'); // Replace with your API endpoint
        const data = await response.json();

        const patientsData = data.entry.map((entry : BundleEntry) => entry.resource); // Extract the resource property
        setPatients(patientsData); // Store the extracted patients in state
        console.log(patientsData);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };



  return (
    <div>
        <table>
            <thead>
            <tr>
                <th>Identifier</th>
                <th>Active</th>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Gender</th>
                <th>Birth Day</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Adresse Street / Number</th>
                <th>Adresse Postalcode</th>
                <th>Adresse City</th>
                <th>Adresse State</th>
                <th>Adresse Country</th>
            </tr>
            </thead>
                <tbody>
                    {patients.map(patient => (
                        <tr key={patient.id}>
                            <td>{patient.identifier?.[0]?.value}</td>
                            <td>{(patient.active? "aktiv": "inaktiv")}</td>
                            <td>{patient.name?.[0]?.given}</td>
                            <td>{patient.name?.[0]?.family}</td>    
                            <td>{patient.gender}</td>
                            <td>{patient.birthDate}</td>
                            <td>{patient.telecom?.[0]?.value}</td>
                            <td>{patient.telecom?.[1]?.value}</td>
                            <td>{patient.address?.[0]?.line}</td>
                            <td>{patient.address?.[0]?.postalCode}</td>
                            <td>{patient.address?.[0]?.city}</td>
                            <td>{patient.address?.[0]?.state}</td>
                            <td>{patient.address?.[0]?.country}</td>
                        </tr>
                    ))}
                </tbody>
        </table>

    </div>
  );
};

export default PatientList;
