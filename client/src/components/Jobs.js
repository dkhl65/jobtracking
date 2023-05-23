import React, { useState, useEffect, useRef, useMemo } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  Container,
  Button,
  Toolbar,
  Box,
  TextField,
  Alert,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableSortLabel,
  TablePagination,
} from "@mui/material";
import JobDialogs from "./JobDialogs";
import NavBar from "./NavBar";
import JobRow from "./JobRow";

function Jobs() {
  const axiosPrivate = useAxiosPrivate();
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [jobs, setJobs] = useState([]);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("application");
  const dialogRef = useRef();
  const visibleRows = useMemo(() => {
    jobs.sort((x, y) => {
      const a = x[orderBy].toLowerCase();
      const b = y[orderBy].toLowerCase();
      if ((a < b && order === "asc") || (a > b && order === "desc")) {
        return -1;
      }
      if ((a > b && order === "asc") || (a < b && order === "desc")) {
        return 1;
      }
      return 0;
    });
    return jobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [jobs, page, rowsPerPage, order, orderBy]);

  const reloadJobs = () => {
    setLoadingJobs(true);
    axiosPrivate
      .get("/jobs")
      .then((res) => {
        setJobs(res.data);
        setLoadingJobs(false);
      })
      .catch((err) => {
        if (!err?.response) {
          setLoadingJobs("No server response.");
        } else if (err.response?.status === 500) {
          setLoadingJobs(
            `Internal server error: ${
              err.response.data?.name || "unknown error"
            }. Please try again later.`
          );
        } else {
          setLoadingJobs(err.message);
        }
      });
  };

  const changeOrder = (column, defaultOrder = "desc") => {
    if (orderBy === column && order === defaultOrder) {
      setOrder(defaultOrder === "desc" ? "asc" : "desc");
    } else {
      setOrder(defaultOrder);
    }
    setOrderBy(column);
  };

  useEffect(() => {
    reloadJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: "10px", mb: "10px" }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, mb: "10px" }}>
            <TextField placeholder="Search…" />
          </Box>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100, { label: "All", value: -1 }]}
            component="div"
            count={jobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(+e.target.value);
              setPage(0);
            }}
            showFirstButton
            showLastButton
          />
          <Button
            variant="contained"
            sx={{ ml: "10px" }}
            onClick={() => dialogRef.current.openNewForm()}
          >
            Add Job
          </Button>
        </Toolbar>
        <TableContainer
          component={Paper}
          sx={{ backgroundColor: "ghostwhite" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "company"}
                    direction={orderBy === "company" ? order : "asc"}
                    onClick={() => changeOrder("company", "asc")}
                  >
                    Company
                  </TableSortLabel>
                </TableCell>
                <TableCell>Location</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "application"}
                    direction={orderBy === "application" ? order : "desc"}
                    onClick={() => changeOrder("application")}
                  >
                    Application Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "assessment"}
                    direction={orderBy === "assessment" ? order : "desc"}
                    onClick={() => changeOrder("assessment")}
                  >
                    Technical Assessment Dates
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "interview"}
                    direction={orderBy === "interview" ? order : "desc"}
                    onClick={() => changeOrder("interview")}
                  >
                    Interview Dates
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "rejection"}
                    direction={orderBy === "rejection" ? order : "desc"}
                    onClick={() => changeOrder("rejection")}
                  >
                    Rejection Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row, index) => (
                <JobRow key={index} job={row} reloadJobs={reloadJobs} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {loadingJobs === true && (
            <Alert severity="info">
              Loading your list of job applications...
            </Alert>
          )}
          {loadingJobs.length && (
            <Alert severity="error">
              Could not load your job applications. {loadingJobs}
            </Alert>
          )}
        </Box>
      </Container>
      <JobDialogs ref={dialogRef} reloadJobs={reloadJobs} />
    </>
  );
}

export default Jobs;
