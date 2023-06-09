import React from 'react';
import { fhirR4 } from '@smile-cdr/fhirts';


const PatientForm: React.FC = () => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newIdentifier = new fhirR4.Identifier(); 
    newIdentifier.value = (e.currentTarget.elements.namedItem('identifier') as HTMLInputElement).value;

    const newHumanName = new fhirR4.HumanName(); 
    newHumanName.prefix = [(e.currentTarget.elements.namedItem('DrorProf') as HTMLInputElement).value];
    newHumanName.family = (e.currentTarget.elements.namedItem('Nachname') as HTMLInputElement).value;
    newHumanName.given = [(e.currentTarget.elements.namedItem('Vorname') as HTMLInputElement).value];


    let genderValue = (e.currentTarget.elements.namedItem('gender') as HTMLInputElement).value;
    const genderVal: fhirR4.Patient.GenderEnum | undefined = genderValue === 'male' || genderValue === 'female' || genderValue === 'other' || genderValue === "unknown" ? genderValue: undefined;

    const db = (e.currentTarget.elements.namedItem('year') as HTMLInputElement).value + "-" + (e.currentTarget.elements.namedItem('month') as HTMLInputElement).value + "-" + (e.currentTarget.elements.namedItem('day') as HTMLInputElement).value; 

    const newEmail = new fhirR4.ContactPoint(); 
    newEmail.system = "email";
    newEmail.value = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;


    const newPhone = new fhirR4.ContactPoint(); 
    newPhone.system = "phone";
    newPhone.value = (e.currentTarget.elements.namedItem('phone') as HTMLInputElement).value;

    const newAdresss = new fhirR4.Address(); 
    newAdresss.line = [(e.currentTarget.elements.namedItem('street_number') as HTMLInputElement).value];
    newAdresss.city = (e.currentTarget.elements.namedItem('city') as HTMLInputElement).value;
    newAdresss.postalCode = (e.currentTarget.elements.namedItem('postalCode') as HTMLInputElement).value;
    newAdresss.state = (e.currentTarget.elements.namedItem('state') as HTMLInputElement).value;
    newAdresss.country = (e.currentTarget.elements.namedItem('country') as HTMLInputElement).value;

    const newPatient: fhirR4.Patient = {
      identifier: [newIdentifier],                                                          // An identifier for this patient
      active: (e.currentTarget.elements.namedItem('active') as HTMLInputElement).checked,   // Whether this patient's record is in active use
      name: [newHumanName],                                                                 // Whether this patient's record is in active use
      telecom: [newPhone, newEmail],                                                                          // A contact detail for the individual
      gender: genderVal,                                                                    // male | female | other | unknown
      birthDate: db,  //The format is YYYY, YYYY-MM, or YYYY-MM-DD
      deceasedBoolean: false, 
      deceasedDateTime: "",
      address: [newAdresss],
      //maritalStatus: , Codeabel Concept? 
      multipleBirthBoolean: false,
      multipleBirthInteger: 0,
      photo: [], 
      contact: [],
      communication: [], 
      resourceType: "Patient",
    }

    console.log(newPatient); // Example: Output patient data to the console
    console.log(JSON.stringify(newPatient));


    fetch("http://localhost:8080/fhir/Patient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPatient),
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the API
      console.log("Response from API:", data);
    })
    .catch(error => {
      // Handle any errors that occur during the request
      console.error("Error:", error);
    });
  };

  return (
    <form className="" onSubmit={handleSubmit}>

      <div className="p-4">
        <label>
          Identifier:
          <input className="border-b-2" type="text" name="identifier" />
        </label>
        <br />
      </div>

      <div className="p-4">
        <label>
          Select Titel
          <select name="DrorProf" defaultValue="">
            <option value="" disabled>Select Titel</option>
            <option value="Dr.">Dr.</option>
            <option value="Prof.">Prof.</option>
            <option value="">None</option>
          </select>
          Vorname:
          <input className="border-b-2" type="text" name="Vorname" />
          
          Nachname:
          <input className="border-b-2" type="text" name="Nachname" />
        </label>
      <br />
      </div>

      <div className="p-4">
        <label>
          <span>Active: </span>
          <input className="w-6 h-6 p-5" type="checkbox" name="active" />
        </label>
        <br />
      </div>

      <div className="p-4">
        <label>
          Gender:
          <select name="gender" defaultValue="">
            <option value="" disabled>Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
          </select>

        </label>
        <br />
      </div>

      <div className="p-4">
        <label>
          BirthDate
          Day:
          <select name="day" defaultValue="">
            <option value="" disabled>Select day</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day.toString().padStart(2, '0')}>
                {day.toString().padStart(2, '0')}
              </option>
            ))}
          </select>

          Month:
          <select name="month" defaultValue="">
            <option value="" disabled>Select month</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month.toString().padStart(2, '0')}>
                {month.toString().padStart(2, '0')}
              </option>
            ))}
          </select>


          Year:
            <select name="year" defaultValue="">
              <option value="" disabled>Select year</option>
                {Array.from({ length: 2023 - 1940 + 1 }, (_, i) => 1940 + i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
            </select>
        </label>
        <br />
      </div>

      <div className="p-4">
        <label>
          Phone:
          <input className="rounded border-b-2" type="text" name="phone"/>
          Email:
          <input className="rounded border-b-2" type="text" name="email"/>
        </label>
        <br />
      </div>


      <div className="p-4">
        <label>
          Street and Number:
          <input className="rounded border-b-2" type="text" name="street_number"/>
        </label>
        <br />
      </div>


      <div className="p-4">
        <label>
          Postal Code:
          <input className="rounded border-b-2" type="text" name="postalCode"/>
          City:
          <input className="rounded border-b-2" type="text" name="city"/>
        </label>
        <br />
      </div>

      <div className="p-4">
        <label>
          State:
          <input className="rounded border-b-2" type="text" name="state"/>
          Country:
          <input className="rounded border-b-2" type="text" name="country"/>
        </label>
        <br />
      </div>


      <div className="p-4">
        <button className='transition ease-in-out delay-110 bg-blue-500 hover:scale-110 duration-300 p-2 rounded-md text-white' type="submit">Submit</button>
      </div>
    
    </form>
  );
};

export default PatientForm;




