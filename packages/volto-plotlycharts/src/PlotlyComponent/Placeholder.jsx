function Placeholder() {
  return (
    <div className="plotly-placeholder">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 240"
        width="48"
        height="48"
      >
        <defs>
          <clipPath id="clip">
            <rect width="240" height="240" />
          </clipPath>
        </defs>
        <g clipPath="url(#clip)">
          <g transform="matrix(1,0,0,1,30,0)">
            <path
              className="bar"
              d="M 0, 120 L 0, 120"
              stroke="#004B7F"
              strokeWidth="30"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M 0, 120 L 0, 120; M 0, 15 L 0, 225; M 0, 120, L 0, 120;"
                dur="1.5s"
                keyTimes="0; 0.5; 1"
                repeatCount="indefinite"
              />
            </path>
          </g>
          <g transform="matrix(1,0,0,1,75,0)">
            <path
              className="bar"
              d="M 0, 90 L 0, 150"
              stroke="#007B6C"
              strokeWidth="30"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M 0, 90 L 0, 150; M 0, 120 L 0, 120; M 0, 15, L 0, 225; M 0, 90 L 0, 150;"
                dur="1.5s"
                keyTimes="0; 0.125; 0.625; 1"
                repeatCount="indefinite"
              />
            </path>
          </g>
          <g transform="matrix(1,0,0,1,120,0)">
            <path
              className="bar"
              d="M 0, 15 L 0, 225"
              stroke="#50B0A4"
              strokeWidth="30"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M 0, 15 L 0, 225; M 0, 120 L 0, 120; M 0, 15 L 0, 225"
                dur="1.5"
                keyTimes="0; 0.5; 1"
                repeatCount="indefinite"
              />
            </path>
          </g>
          <g transform="matrix(1,0,0,1,165,0)">
            <path
              className="bar"
              d="M 0, 90 L 0, 150"
              stroke="#FDAF20"
              strokeWidth="30"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M 0, 90 L 0, 150; M 0, 120 L 0, 120; M 0, 15, L 0, 225; M 0, 90 L 0, 150;"
                dur="1.5s"
                keyTimes="0; 0.125; 0.625; 1"
                repeatCount="indefinite"
              />
            </path>
          </g>
          <g transform="matrix(1,0,0,1,210,0)">
            <path
              className="bar"
              d="M 0, 120 L 0, 120"
              stroke="#FDEC9B"
              strokeWidth="30"
              strokeLinecap="round"
            >
              <animate
                attributeName="d"
                values="M 0, 120 L 0, 120; M 0, 15 L 0, 225; M 0, 120, L 0, 120;"
                dur="1.5s"
                keyTimes="0; 0.5; 1"
                repeatCount="indefinite"
              />
            </path>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default Placeholder;
