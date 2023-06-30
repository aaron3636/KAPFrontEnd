import React, { useState } from "react";
import { fhirR4 } from "@smile-cdr/fhirts";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import HomeButton from "./HomeButton";
import SubmissionStatus from "./SubmissonStatus";

const MediaInput: React.FC = () => {
  // State variables
  const { patientId } = useParams();
  const [selectedFiles, setSelectedFiles] = useState<string[] | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  /**
   * Handles the form submission event.
   * POST to "http://localhost:8080/fhir/Media"
   * @param e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create a new identifier for the Media
    const newIdentifier = new fhirR4.Identifier();
    newIdentifier.value = (
      e.currentTarget.elements.namedItem("identifier") as HTMLInputElement
    ).value;

    //define the status of the Media
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

    //define the tyep of Media
    const typeOfMedia = new fhirR4.CodeableConcept();
    const typeOfMediaCoding = new fhirR4.Coding(); 
    typeOfMediaCoding.system = "http://terminology.hl7.org/CodeSystem/media-type";
    typeOfMediaCoding.code = (e.currentTarget.elements.namedItem("typeOfMedia") as HTMLInputElement).value;
    typeOfMedia.coding = [typeOfMediaCoding];

    //define the patient reference
    const newPatientReference = new fhirR4.Reference(); 
    newPatientReference.type = "Patient"; 
    newPatientReference.reference = 'Patient/' + patientId;

    //define the dateTime in the needed format
    const dateTime = (e.currentTarget.elements.namedItem("dateTime") as HTMLInputElement).value + ":00+02:00";
    
    //define the bodySite
    const bodySite = new fhirR4.CodeableConcept(); 
    const bodySiteCoding = new fhirR4.Coding(); 
    bodySiteCoding.system = "http://hl7.org/fhir/ValueSet/body-site";
    bodySiteCoding.code = (e.currentTarget.elements.namedItem("bodySite") as HTMLInputElement).value;
    bodySite.coding = [bodySiteCoding];

    //deifne the annotation
    const note = new fhirR4.Annotation(); 
    note.text = (e.currentTarget.elements.namedItem("note") as HTMLInputElement).value;

    if (selectedFiles) {

      for (let i = 0; i < selectedFiles.length; ++i) {

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
            if (!response.ok) {
              setSubmissionStatus("failure");
            }
            response.json();
          })
          .then((data) => {
            // Handle the response from the API

            //I THINK THIS IS NOT IMPORTANT? 
            console.log("Response from API:", data);
          })
          .catch((error) => {
            // Handle any errors that occur during the request
            console.error("Error:", error);
            setSubmissionStatus("failure");
          });
      }
      setSubmissionStatus("success");
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
              defaultValue={uuidv4()}
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

        <SubmissionStatus 
          submissionStatus={submissionStatus} 
          submissionTextSucess={"Media was successfully added to the Database."} 
          submissionHeadlineSucess={"Submission successful!"}
          submissionHeadlineFailure={"Submission failed. Please try again."}
          submissionTextFailure={"Media could not be successfully added to the Database."}></SubmissionStatus>
      </form>
    </div> 
  );
};

export default MediaInput;
