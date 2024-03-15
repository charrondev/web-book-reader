// import { useRouteError } from "react-router";

// export default function ErrorPage() {
//     const error = useRouteError();
//     console.error(error);

//     return (
//         <div id="error-page">
//             <h1>Oops!</h1>
//             <p>Sorry, an unexpected error has occurred.</p>
//             <p>
//                 <i>{extractErrorMessage(error)}</i>
//             </p>
//         </div>
//     );
// }

// function extractErrorMessage(error: unknown): string {
//     if (error == null) {
//         return "Unknown Error";
//     }

//     if (typeof error !== "object") {
//         return "Unknown error";
//     }

//     if ("statusText" in error && typeof error.statusText === "string") {
//         return error.statusText;
//     }

//     if ("message" in error && typeof error.message === "string") {
//         return error.message;
//     }

//     return "Unknown error";
// }
