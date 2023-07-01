import React, { ChangeEvent, FormEvent, useState } from "react";
import { fhirR4 } from "@smile-cdr/fhirts";

interface EditObservationFormProps {
  observation: fhirR4.Observation;
  media: fhirR4.Media[];
  onSave: (event: FormEvent, editedObservation: fhirR4.Observation, editedMedia: fhirR4.Media[]) => Promise<void>;
  onCancel: () => void;
}

const EditObservationForm: React.FC<EditObservationFormProps> = ({
  observation,
  media, 
  onSave,
  onCancel,
}) => {
  const [editedObservation, setEditedObservation] = useState<fhirR4.Observation>(observation);
  const [editedMedia, setEditedMedia] = useState<fhirR4.Media[]>([]);

  //TODO: Upgrade

  const handleInputChange = (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>): void => {
    // Extract the name and value from the event target (input field)
    const { name, value } = e.target;
    if (name === "identifier") {
        // Handle BirthDate field differently
        const newIdentifier = new fhirR4.Identifier();
            newIdentifier.value = value;
        setEditedObservation((prevObservation) => ({
            ...prevObservation,
            identifier: [newIdentifier],
        }));

    } else if (name === "status") {
        const statusValue: fhirR4.Observation.StatusEnum | undefined =
        value === "registered" ||
        value === "preliminary" ||
        value === "final"
        ? value : "preliminary";

        setEditedObservation((prevObservation) => ({
            ...prevObservation,
            status: statusValue,
            }));  
    } else if (name === "category") {

        const observationCategory = new fhirR4.CodeableConcept();
        //define the  
        const newCategoryCoding = new fhirR4.Coding(); 
        newCategoryCoding.system = "http://hl7.org/fhir/ValueSet/observation-category";
        newCategoryCoding.code = value;
        observationCategory.coding = [newCategoryCoding];

        setEditedObservation((prevObservation) => ({
            ...prevObservation,
            effectiveDateTime: value + ":00+02:00",
            }));
    } else if (name === "date") {
        setEditedObservation((prevObservation) => ({
            ...prevObservation,
            effectiveDateTime: value + ":00+02:00",
            }));
    } else {
      // Update the editedPatient state
      setEditedObservation((prevPatient) => ({
        // Create a new object with the same properties as prevPatient
        ...prevPatient,
        // Update the name property with the new value
        name: [
          // Create a new name array with the updated value
          {
            // Copy the existing name object or create a new one if it doesn't exist
            //...prevPatient.status?.[0],
            // Update the specific field (identified by the name) with the new value
            [name]: value,
          },
        ],
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await onSave(e, editedObservation, editedMedia);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Edit Observation</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="givenName" className="text-lg font-medium">
            Identifier:
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={editedObservation.identifier?.[0]?.value|| ""}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
            <label htmlFor="givenName" className="text-lg font-medium0">
                Status:
            </label>
                <select className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500" name="status" defaultValue={editedObservation.status} 
                onChange={handleInputChange}>
                    <option value="" disabled>
                        Select Status
                    </option>
                    <option value="registered">registered</option>
                    <option value="preliminary">preliminary</option>
                    <option value="final">final</option>
                </select>
        </div>

        <div className="mb-4">
          <label htmlFor="familyName" className="text-lg font-medium">
            Category:
          </label>
          <select className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500" name="category" defaultValue="" onChange={handleInputChange}>
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
        </div>
        <div className="mb-4">
          <label htmlFor="birthdate" className="text-lg font-medium">
            Date:
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            defaultValue={editedObservation.effectiveDateTime}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {/* Add more fields as needed */}
      </form>
    </div>
  );
};

export default EditObservationForm;