import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route

  useEffect(() => {
    // Function to handle dropdown clicks
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest('.dropdown');

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains('open');

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll('.sidebar-menu .dropdown');
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove('open');
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add('open');
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll('.sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link');

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener('click', handleDropdownClick);
    });

    // Function to open submenu based on current route
    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll('.sidebar-menu .dropdown');
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll('.sidebar-submenu li a');
        submenuLinks.forEach((link) => {
          if (link.getAttribute('href') === location.pathname || link.getAttribute('to') === location.pathname) {
            dropdown.classList.add('open');
          }
        });
      });
    };

    // Open the submenu that contains the open route
    openActiveDropdown();



    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener('click', handleDropdownClick);
      });

    };
  }, [location.pathname]);


  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };



  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside className={sidebarActive ? "sidebar active " : mobileMenu ? "sidebar sidebar-open" : "sidebar"}>
        <button onClick={mobileMenuControl} type="button" className="sidebar-close-btn">
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div>
          <Link to="/" className="sidebar-logo">
            <p className="light-logo"
              style={{fontSize : 20+'px', textAlign : 'center'}}
            >
              <b>
                AI DOCUMENTE
              </b>
            </p>
          </Link>
        </div>
        <div className="sidebar-menu-area">
          <ul className="sidebar-menu" id="sidebar-menu">
            <li className="dropdown">
              <Link to="#">
                <Icon icon="solar:home-smile-angle-outline" className="menu-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button type="button" className="sidebar-toggle" onClick={sidebarControl}>
                  {
                    sidebarActive ? (<Icon
                      icon="iconoir:arrow-right"
                      className="icon text-2xl non-active"
                    />) : (<Icon
                      icon="heroicons:bars-3-solid"
                      className="icon text-2xl non-active "
                    />)
                  }
                </button>
                <button onClick={mobileMenuControl} type="button" className="sidebar-mobile-toggle">
                  <Icon
                    icon="heroicons:bars-3-solid"
                    className="icon"
                  />
                </button>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">
                {/* ThemeToggleButton */}
                <ThemeToggleButton />
                <div className="dropdown d-none d-sm-inline-block">

                  <div className="dropdown-menu to-top dropdown-menu-sm">
                    <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-0">
                          Choose Your Language
                        </h6>
                      </div>
                    </div>
                    <div className="max-h-400-px overflow-y-auto scroll-sm pe-8">
                      <div className="form-check style-check d-flex align-items-center justify-content-between mb-16">
                        <label
                          className="form-check-label line-height-1 fw-medium text-secondary-light"
                          htmlFor="english"
                        >
                          <span className="text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3">
                            <img
                              src="assets/images/flags/flag1.png"
                              alt=""
                              className="w-36-px h-36-px bg-success-subtle text-success-main rounded-circle flex-shrink-0"
                            />
                            <span className="text-md fw-semibold mb-0">
                              English
                            </span>
                          </span>
                        </label>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="crypto"
                          id="english"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification dropdown end */}
                <div className="dropdown">
                  <Link
                    className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3"
                    to="/sign-in"
                  >
                    <Icon icon="ri-user-settings-line" className="menu-icon" />
                  </Link>
                  <div className="dropdown-menu to-top dropdown-menu-sm">
                    <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-2">
                          User
                        </h6>
                      </div>
                      <button type="button" className="hover-text-danger">
                        <Icon icon="radix-icons:cross-1" className="icon text-xl" />
                      </button>
                    </div>
                    <ul className="to-top-list">
                      <li>
                        <Link
                          className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3"
                          to="#"
                        >
                          <Icon icon="lucide:power" className="icon text-xl" /> Log Out
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}

              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className="dashboard-main-body">{children}</div>

        {/* Footer section */}
        <footer className="d-footer">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <p className="mb-0">© 2024. All Rights Reserved.</p>
            </div>
            <div className="col-auto">
              <p className="mb-0">
                {/* Made by <span className="text-primary-600">wowtheme7</span> */}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default MasterLayout;
