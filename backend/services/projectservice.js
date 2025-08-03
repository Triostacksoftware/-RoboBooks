import Project from '../models/project.model.js';
export const createProject = (data) => Project.create(data);
export const listProjects = () => Project.find();

