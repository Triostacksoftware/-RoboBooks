import Project from "../models/projectmodel.js";
export const createProject = (data) => Project.create(data);
export const listProjects = () => Project.find();
