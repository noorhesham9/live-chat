/* eslint-disable react/prop-types */
function Avatar({ userId, username, online }) {
  const colors = [
    "bg-teal-200",
    "bg-red-200",
    "bg-green-200",
    "bg-purple-200",
    "bg-blue-200",
    "bg-yellow-200",
  ];

  const UserIdBase = parseInt(userId, 16);
  const color = colors[UserIdBase % colors.length];
  return (
    <div className={"w-8 h-8 rounded-full relative flex items-center " + color}>
      <div className="text-center w-full opacity-70"> {username[0]}</div>
      {online && (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 -right-1 rounded-full border border-white shadow "></div>
      )}{" "}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
}

export default Avatar;
