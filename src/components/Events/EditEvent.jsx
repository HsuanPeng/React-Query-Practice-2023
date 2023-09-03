import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, updateEvent } from "../../util/http.js";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: inputData,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id],
    queryFn: () => fetchEvent({ id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
  });

  function handleSubmit(formData) {
    mutate({ id: id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message || "Failed to load event please try again later"
          }
        />
        <div className="form-actions">
          <Link to="../" className="button-text">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (inputData) {
    content = (
      <EventForm inputData={inputData} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
