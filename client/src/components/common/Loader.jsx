const Loader = ({ label = "Loading..." }) => {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};

export default Loader;
