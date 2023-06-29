import React, { useState } from "react";
import { fhirR4 } from "@smile-cdr/fhirts";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import HomeButton from "./HomeButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { noAuto } from "@fortawesome/fontawesome-svg-core";

const MediaInput: React.FC = () => {
  // State variables
  const { patientId } = useParams();
  const [selectedFiles, setSelectedFiles] = useState<string[] | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const navigate = useNavigate();

  /**
   * Handles the form submission event.
   * POST to "http://localhost:8080/fhir/Patient"
   * @param e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log(selectedFiles);

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

    const newStatus : fhirR4.Code =
    statusValue === "preparation" ||
    statusValue === "in-progress" ||
    statusValue === "not-done" ||
    statusValue === "on-hold" ||
    statusValue === "stopped" ||
    statusValue === "completed" ||
    statusValue === "entered-in-error" ||
    statusValue === "unknown"
      ? statusValue
      : "preliminary";

    const typeOfMedia = new fhirR4.CodeableConcept();
    //define the  
    const typeOfMediaCoding = new fhirR4.Coding(); 
    typeOfMediaCoding.system = "http://terminology.hl7.org/CodeSystem/media-type";
    typeOfMediaCoding.code = (e.currentTarget.elements.namedItem("typeOfMedia") as HTMLInputElement).value;
    typeOfMedia.coding = [typeOfMediaCoding];

    const newPatientReference = new fhirR4.Reference(); 
    newPatientReference.type = "Patient"; 
    newPatientReference.reference = 'Patient/' + patientId;

    // Construct the birth date in the required format
    const dateTime = (e.currentTarget.elements.namedItem("dateTime") as HTMLInputElement).value + ":00+02:00";

    console.log(dateTime);
    
    const bodySite = new fhirR4.CodeableConcept(); 
    const bodySiteCoding = new fhirR4.Coding(); 
    bodySiteCoding.system = "http://hl7.org/fhir/ValueSet/body-site";
    bodySiteCoding.code = (e.currentTarget.elements.namedItem("bodySite") as HTMLInputElement).value;
    bodySite.coding = [bodySiteCoding];

    const note = new fhirR4.Annotation(); 
    note.text = (e.currentTarget.elements.namedItem("note") as HTMLInputElement).value;


    
    if (selectedFiles) {

      const status_media_upload = new Array(selectedFiles.length).fill(false);


      for (let i = 0; i < selectedFiles.length; ++i) {

        console.log(selectedFiles[i]);

        const file: string = selectedFiles[i];

        const fileDataAsString = file.split(",")[1];
        let fileMetaDataAsString = file.split(",")[0];
        fileMetaDataAsString = fileMetaDataAsString.split(";")[0];
        fileMetaDataAsString = fileMetaDataAsString.split(":")[1];

        const photoAttachment: fhirR4.Attachment = {
          contentType: fileMetaDataAsString,
          data: fileDataAsString,
          id: uuidv4(), // Generate a unique ID for the attachment
        };

        const media : fhirR4.Media = {
          identifier: [newIdentifier], 
          status: newStatus, 
          type: typeOfMedia, 
          subject: newPatientReference, 
          createdDateTime: dateTime, 
          bodySite: bodySite, 
          content: photoAttachment, 
          note: [note], 
          resourceType: "Media"
        };
    
        fetch("http://localhost:8080/fhir/Media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(media),
        })
          .then((response) => {
            console.log(response);
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



    }




};

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files); // Convert FileList to an array
  
      Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
  
            reader.onload = (event: ProgressEvent<FileReader>) => {
              if (event.target && event.target.result) {
                const base64Binary = event.target.result.toString();
                resolve(base64Binary);
              }
            };
  
            reader.onerror = (event: ProgressEvent<FileReader>) => {
              reject(event.target?.error);
            };
  
            reader.readAsDataURL(file); // Read the file as data URL
          });
        })
      )
        .then((base64Binaries) => {
          setSelectedFiles((prevPhotoFiles) => [
            ...(prevPhotoFiles || []),
            ...base64Binaries,
          ]); // Append the new base64 binaries to the existing state
        })
        .catch((error) => {
          console.error('Error converting files:', error);
        });
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
              <option value="preparation">preparation</option>
              <option value="in-progress">in-progress</option>
              <option value="not-done">not-done</option>
              <option value="on-hold">on-hold</option>
              <option value="stopped">stopped</option>
              <option value="completed">completed</option>
              <option value="entered-in-error">entered-in-error</option>
              <option value="unknown">unknown</option>
            </select>
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Type of Media
            <select className="text-sm" name="typeOfMedia" defaultValue="" required>
              <option value="" disabled>
                Select type of Media
              </option>
              <option value="image">image</option>
              <option value="video">video</option>
              <option value="audio">audio</option>
            </select>
          </label>
          <br />
        </div>

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Date and Time:
            <input
              className="rounded border-b-2"
              type="datetime-local"
              name="dateTime"
              required
            />
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

        <div className="p-3 font-mono md:font-mono text-lg/5 md:text-lg/5">
          <label>
            Photo:
            <input type="file" accept="image/*" onChange={handlePhotoChange} multiple required/>
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

export default MediaInput;
