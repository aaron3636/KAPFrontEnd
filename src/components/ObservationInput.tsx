import React, { useState } from "react";
import { fhirR4 } from "@smile-cdr/fhirts";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import HomeButton from "./HomeButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ObservationForm: React.FC = () => {
  // State variables
  const { patientId } = useParams();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const navigate = useNavigate();

  /**
   * Handles the form submission event.
   * POST to "http://localhost:8080/fhir/Patient"
   * @param e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log(patientId)

    e.preventDefault();
    // Create a new identifier for the patient
    const newIdentifier = new fhirR4.Identifier();
    newIdentifier.value = (
      e.currentTarget.elements.namedItem("identifier") as HTMLInputElement
    ).value;

    //define the status of the observation
    let statusValue = (
        e.currentTarget.elements.namedItem("status") as HTMLInputElement
    ).value;

    const newStatus: fhirR4.Observation.StatusEnum | undefined =
        statusValue === "registered" ||
        statusValue === "preliminary" ||
        statusValue === "final"
        ? statusValue : "preliminary";

    const newCategory = new fhirR4.CodeableConcept();
    //define the  
    const newCategoryCoding = new fhirR4.Coding(); 
    newCategoryCoding.system = "http://hl7.org/fhir/ValueSet/observation-category";
    newCategoryCoding.code = (e.currentTarget.elements.namedItem("category") as HTMLInputElement).value;
    newCategory.coding = [newCategoryCoding];

    const newObservationCoding = new fhirR4.CodeableConcept();
    //define the Observation coding 
    const newTypeOfObservationCoding = new fhirR4.Coding(); 
    newTypeOfObservationCoding.system = "http://hl7.org/fhir/ValueSet/observation-codes";
    newTypeOfObservationCoding.code = (e.currentTarget.elements.namedItem("loinc_code") as HTMLInputElement).value;
    newObservationCoding.coding = [newTypeOfObservationCoding];

    const newPatientReference = new fhirR4.Reference(); 
    newPatientReference.type = "Patient"; 
    newPatientReference.reference = 'http://localhost:8080/fhir/Patient/' + patientId;

    console.log(newPatientReference.reference)

    // Construct the birth date in the required format
    const dateTime =
      (e.currentTarget.elements.namedItem("year") as HTMLInputElement).value +
      "-" +
      (e.currentTarget.elements.namedItem("month") as HTMLInputElement).value +
      "-" +
      (e.currentTarget.elements.namedItem("day") as HTMLInputElement).value;



    //Create the Observation
    const observation: fhirR4.Observation = {
        identifier: [newIdentifier], // An identifier for this patient
        status: newStatus, 
        category: [newCategory],
        code: newObservationCoding,
        effectiveDateTime: dateTime,
        resourceType: "Observation"
    };

    /*if (photoFile) {
      const photoAttachment: fhirR4.Attachment = {
        contentType: photoFile.type,
        data: "",
        id: uuidv4(), // Generate a unique ID for the attachment
      };
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          photoAttachment.data = reader.result.split(",")[1] || "";
          observation.value[0]. = [photoAttachment];
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
    */
    
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
        Enter new Observation
      </div>
      <form className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3"
        onSubmit={handleSubmit}>

       <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Identifier:
            <input
              className="rounded border-b-2"
              type="text"
              name="identifier"
              required
              defaultValue={patientId}
            />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Status:
            <select className="text-sm" name="status" defaultValue="" required>
              <option value="" disabled>
                Select Status
              </option>
              <option value="registered">registered</option>
              <option value="preliminary">preliminary</option>
              <option value="final">final</option>

            </select>
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Category
            <select className="text-sm" name="category" defaultValue="" required>
              <option value="" disabled>
                Select category
              </option>
              <option value="vital-signs">vital-signs</option>
              <option value="imaging">imaging</option>
              <option value="labratory">labratory</option>
              <option value="procedure">procedure</option>
              <option value="survey">survey</option>
              <option value="exam">exam</option>
              <option value="therapy">therapy</option>
              <option value="activity">activity</option>
            </select>
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            LOINC Code:
            <input
              className="rounded border-b-2"
              type="text"
              name="loinc_code"
              required
            />
          </label>
          <br />
        </div>

    {/*   <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Subject:
            <input
              className="rounded border-b-2"
              type="text"
              name="subject"
              required
            />
          </label>
          <br />
        </div>
        */}

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Date and Time:

            <input
              className="rounded border-b-2"
              type="number"
              name="hour"
              min="0"
              max="23"
              required
            />
            :
            <input
              className="rounded border-b-2"
              type="number"
              name="minute"
              min="0"
              max="59"
              required
            />
    
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
            Photo:
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            BodySite:
            <input 
                className="rounded border-b-2"
                type="text"
                name="bodySite"
                />
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Note:
            <div>
                <textarea
                className="resize border rounded-md"
                name="note">
                </textarea>
            </div>
          </label>
          <br />
        </div>

        <div className="justify-center flex-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded object-center text-lg "
            type="submit">
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

export default ObservationForm;
