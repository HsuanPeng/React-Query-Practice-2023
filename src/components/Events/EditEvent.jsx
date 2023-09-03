import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";

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
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", id] }); // 取消先前的query
      const previousEvent = queryClient.getQueryData(["events", id]); // 從cache中取得先前的資料

      queryClient.setQueryData(["events", id], newEvent); // 直接改變cache中的資料，不用等待fetch=>即時更新UI=>optimistic Updating

      return { previousEvent };
    },
    onError: (error, data, context) => {
      // context來自上方onMutate的return
      queryClient.setQueryData(["events", id], context.previousEvent); // 如果update失敗，就使用cache中的舊資料，因為資料並沒有被更新到backend
    },
    // onSettled，不管成功或失敗，都會執行
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events", id] }); // 使cached invalidated，強迫重新fetch
    },
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
