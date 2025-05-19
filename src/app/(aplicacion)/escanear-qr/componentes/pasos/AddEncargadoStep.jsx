import AddEncargado from "../AddEncargado";
import TallerDecision from "../TallerDesicion";

const AddEncargadoStep = ({ updateState, state, matricula }) => {
  const manejarDecision = (decision) => {
    updateState("llevarAlTaller", decision);
  };

  const { llevarAlTaller } = state;

  return (
    <div className="flex flex-col items-center justify-center">
      {!llevarAlTaller ? (
        <TallerDecision
          manejarDecision={manejarDecision}
          matricula={matricula}
          updateState={updateState}
        />
      ) : (
        <AddEncargado
          state={state}
          updateState={updateState}
          manejarDecision={manejarDecision}
        />
      )}
    </div>
  );
};

export default AddEncargadoStep;
