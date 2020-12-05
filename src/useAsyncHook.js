import React from "react";

function useSafeDispatch(dispatch) {
  const mounted = React.useRef(false);
  React.useLayoutEffect(() => {
    mounted.current = true;

    return () => (mounted.current = false);
  }, []);

  return React.useCallback(
    (...args) => {
      if (mounted.current) {
        dispatch(...args);
      }
    },
    [dispatch]
  );
}
const STATUS = {
  idle: Symbol("idle"),
  pending: Symbol("pending"),
  resolved: Symbol("resolved"),
  rejected: Symbol("rejected"),
};
const defaultInitialState = {
  status: STATUS.idle,
  data: null,
  error: null,
};

function useAsync(initialState) {
  const initialStateRef = React.useRef({
    ...defaultInitialState,
    ...initialState,
  });

  const [{ status, data, error }, setState] = React.useReducer(
    (s, a) => ({ ...s, ...a }),
    initialStateRef.current
  );

  const safeSetState = useSafeDispatch(setState);

  const run = React.useCallback(
    (promise) => {
      if (!promise || !promise.then) {
        throw new Error(
          `The argument passed to useAsync().run must be a promise.`
        );
      }

      safeSetState({ status: STATUS.pending });
      return promise.then(
        (data) => {
          safeSetState({ data, status: STATUS.resolved });
          return data;
        },
        (error) => {
          safeSetState({ status: STATUS.rejected, error });
        }
      );
    },
    [safeSetState]
  );

  const setData = React.useCallback((data) => safeSetState({ data }), [
    safeSetState,
  ]);

  return {
    isIdle: status === STATUS.idle,
    isLoading: status === STATUS.pending,
    isError: status === STATUS.rejected,
    isSuccess: status === STATUS.resolved,
    error,
    data,
    run,
    setData,
  };
}

export default useAsync;
