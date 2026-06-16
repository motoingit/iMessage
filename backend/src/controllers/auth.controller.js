async function checkAuth(req, res) {
  try {
    if(!req.user){
      return res.status(401).json({message: "Unauthorized"});
    }
    res.status(200).json(req.user);
  } catch (error) {
    console.error("[AuthController] Error in checkAuth:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export { checkAuth };
