/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AddPatient from './pages/AddPatient';
import HospitalAlerts from './pages/HospitalAlerts';
import HospitalAnalytics from './pages/HospitalAnalytics';
import HospitalDashboard from './pages/HospitalDashboard';
import HospitalLogin from './pages/HospitalLogin';
import HospitalRegister from './pages/HospitalRegister';
import Landing from './pages/Landing';
import PatientFood from './pages/PatientFood';
import PatientHome from './pages/PatientHome';
import PatientLogin from './pages/PatientLogin';
import PatientMedicines from './pages/PatientMedicines';
import PatientRecord from './pages/PatientRecord';
import SurgeryHistory from './pages/SurgeryHistory';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddPatient": AddPatient,
    "HospitalAlerts": HospitalAlerts,
    "HospitalAnalytics": HospitalAnalytics,
    "HospitalDashboard": HospitalDashboard,
    "HospitalLogin": HospitalLogin,
    "HospitalRegister": HospitalRegister,
    "Landing": Landing,
    "PatientFood": PatientFood,
    "PatientHome": PatientHome,
    "PatientLogin": PatientLogin,
    "PatientMedicines": PatientMedicines,
    "PatientRecord": PatientRecord,
    "SurgeryHistory": SurgeryHistory,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};
