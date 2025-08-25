

import { ModalRenderer } from "@/controllers/modals";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundaryContext } from "react-use-error-boundary";
import App from "./App";
import { ContextMenuContextProvider } from "./contexts/ContextMenuContextProvider";
import Theme from "./contexts/Theme";
import "./index.css";
import { calendarStrings } from "./utils";

dayjs.extend(relativeTime);
dayjs.extend(calendar, calendarStrings);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<ErrorBoundaryContext>
		<BrowserRouter>
			<ContextMenuContextProvider>
				<App />
				<ModalRenderer />
			</ContextMenuContextProvider>
			<Theme />
		</BrowserRouter>
	</ErrorBoundaryContext>,
);
