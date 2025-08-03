import * as ProjectService from '../services/projectservice.js';

export async function create(req, res) {
  try {
    const project = await ProjectService.createProject(req.body);
    res.status(201).json(project);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function list(req, res) {
  try {
    const projects = await ProjectService.listProjects();
    res.json(projects);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}