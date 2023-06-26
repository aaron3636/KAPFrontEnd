import React, { useState } from "react";
import { fhirR4 } from "@smile-cdr/fhirts";
import { v4 as uuidv4 } from "uuid";
import HomeButton from "./HomeButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const PatientForm: React.FC = () => {
  // State variables
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  /**
   * Handles the form submission event.
   * POST to "http://localhost:8080/fhir/Patient"
   * @param e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Create a new identifier for the patient
    const newIdentifier = new fhirR4.Identifier();
    newIdentifier.value = (
      e.currentTarget.elements.namedItem("identifier") as HTMLInputElement
    ).value;
    // Create a new human name for the patient
    const newHumanName = new fhirR4.HumanName();
    newHumanName.prefix = [
      (e.currentTarget.elements.namedItem("DrorProf") as HTMLInputElement)
        .value,
    ];
    newHumanName.family = (
      e.currentTarget.elements.namedItem("Nachname") as HTMLInputElement
    ).value;
    newHumanName.given = [
      (e.currentTarget.elements.namedItem("Vorname") as HTMLInputElement).value,
    ];
    // Get the gender value and validate it
    let genderValue = (
      e.currentTarget.elements.namedItem("gender") as HTMLInputElement
    ).value;
    const genderVal: fhirR4.Patient.GenderEnum | undefined =
      genderValue === "male" ||
      genderValue === "female" ||
      genderValue === "other" ||
      genderValue === "unknown"
        ? genderValue
        : undefined;
    // Construct the birth date in the required format
    const db =
      (e.currentTarget.elements.namedItem("year") as HTMLInputElement).value +
      "-" +
      (e.currentTarget.elements.namedItem("month") as HTMLInputElement).value +
      "-" +
      (e.currentTarget.elements.namedItem("day") as HTMLInputElement).value;
    // Create a new contact point for email
    const newEmail = new fhirR4.ContactPoint();
    newEmail.system = "email";
    newEmail.value = (
      e.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    // Create a new contact point for phone
    const newPhone = new fhirR4.ContactPoint();
    newPhone.system = "phone";
    newPhone.value = (
      e.currentTarget.elements.namedItem("phone") as HTMLInputElement
    ).value;
    // Create a new address for the patient
    const newAdresss = new fhirR4.Address();
    newAdresss.line = [
      (e.currentTarget.elements.namedItem("street_number") as HTMLInputElement)
        .value,
    ];
    newAdresss.city = (
      e.currentTarget.elements.namedItem("city") as HTMLInputElement
    ).value;
    newAdresss.postalCode = (
      e.currentTarget.elements.namedItem("postalCode") as HTMLInputElement
    ).value;
    newAdresss.state = (
      e.currentTarget.elements.namedItem("state") as HTMLInputElement
    ).value;
    newAdresss.country = (
      e.currentTarget.elements.namedItem("country") as HTMLInputElement
    ).value;
    //Create the Patient
    const newPatient: fhirR4.Patient = {
      identifier: [newIdentifier], // An identifier for this patient
      active: (e.currentTarget.elements.namedItem("active") as HTMLInputElement)
        .checked, // Whether this patient's record is in active use
      name: [newHumanName], // Whether this patient's record is in active use
      telecom: [newPhone, newEmail], // A contact detail for the individual
      gender: genderVal, // male | female | other | unknown
      birthDate: db, //The format is YYYY, YYYY-MM, or YYYY-MM-DD
      deceasedBoolean: false,
      deceasedDateTime: "",
      address: [newAdresss],
      //maritalStatus: , Codeable Concept?
      multipleBirthBoolean: false,
      multipleBirthInteger: 0,
      photo: [],
      contact: [],
      communication: [],
      resourceType: "Patient",
    };

    if (photoFile) {
      const photoAttachment: fhirR4.Attachment = {
        contentType: photoFile.type,
        data: "",
        id: uuidv4(), // Generate a unique ID for the attachment
      };
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          photoAttachment.data = reader.result.split(",")[1] || "";
          newPatient.photo = [photoAttachment];
          // Submiting the patient data with the attachment
          // console.log(JSON.stringify(newPatient));
          fetch("http://localhost:8080/fhir/Patient", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newPatient),
          })
            .then((response) => {
              if (response.ok) {
                setSubmissionStatus("success");
              } else {
                setSubmissionStatus("failure");
              }
              response.json();
            })
            .then((data) => {
              // Handle the response from the API
              console.log("Response from API:", data);
            })
            .catch((error) => {
              // Handle any errors that occur during the request
              console.error("Error:", error);
              setSubmissionStatus("failure");
            });
        }
      };
      reader.readAsDataURL(photoFile);
    } else {
      // Submiting the patient data without the attachment.
      console.log(newPatient);
      fetch("http://localhost:8080/fhir/Patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPatient),
      })
        .then((response) => {
          if (response.ok) {
            setSubmissionStatus("success");
          } else {
            setSubmissionStatus("failure");
          }
          response.json();
        })
        .then((data) => {
          // Handle the response from the API
          console.log("Response from API:", data);
        })
        .catch((error) => {
          // Handle any errors that occur during the request
          console.error("Error:", error);
          setSubmissionStatus("failure");
        });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };
  const handleCloseNotification = () => {
    setSubmissionStatus(null);
  };

  return (
    <div>
      <div>
        <HomeButton />
      </div>
      <div className="flex justify-center p-10 bg-sky-800 text-4xl text-white mb-10">
        Enter new Patient
      </div>
      <form
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
        onSubmit={handleSubmit}
      >
        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Given Name:
            <input
              className="rounded border-b-2"
              type="text"
              name="Vorname"
              required
            />
          </label>
          <br />
        </div>
        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Family Name:
            <input
              className="rounded border-b-2"
              type="text"
              name="Nachname"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Title:
            <select className="text-sm" name="DrorProf" defaultValue="">
              <option value="" disabled>
                Select Titel
              </option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
              <option value="">None</option>
            </select>
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Identifier:
            <input
              className="rounded border-b-2"
              type="text"
              name="identifier"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Gender:
            <select className="rounded border-b-2" name="gender" required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Birth Date:
            <input
              className="rounded border-b-2"
              type="number"
              name="day"
              min="1"
              max="31"
              required
            />
            .
            <input
              className="rounded border-b-2"
              type="number"
              name="month"
              min="1"
              max="12"
              required
            />
            .
            <input
              className="rounded border-b-2"
              type="number"
              name="year"
              min="1900"
              max="2023"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Email:
            <input
              className="rounded border-b-2"
              type="email"
              name="email"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Phone:
            <input
              className="rounded border-b-2"
              type="tel"
              name="phone"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Street and Number:
            <input
              className="rounded border-b-2"
              type="text"
              name="street_number"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            City:
            <input
              className="rounded border-b-2"
              type="text"
              name="city"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Postal Code:
            <input
              className="rounded border-b-2"
              type="text"
              name="postalCode"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            State:
            <input
              className="rounded border-b-2"
              type="text"
              name="state"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Country:
            <input
              className="rounded border-b-2"
              type="text"
              name="country"
              required
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Photo:
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Active:
            <input
              className="rounded border-b-2"
              type="checkbox"
              name="active"
              defaultChecked
            />
          </label>
          <br />
        </div>

        <div className="justify-center flex-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded object-center text-lg "
            type="submit"
          >
            Submit
          </button>
        </div>
        {submissionStatus && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center">
              <div className="max-w-md mx-auto">
                <div className="bg-white shadow-lg rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold mr-2">
                      {submissionStatus === "success"
                        ? "Submission successful!"
                        : "Submission failed. Please try again."}
                    </p>
                    <button
                      className="text-gray-800 hover:text-gray-600"
                      onClick={handleCloseNotification}
                    >
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="h-5 w-5 text-gray-800 hover:text-red-400"
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Patient was successfully added to the Database.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PatientForm;
