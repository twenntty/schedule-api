const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Берём токен из заголовка

  if (!token) {
    return res.status(401).json({ message: "Нет токена, доступ запрещен" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Проверяем токен
    req.user = decoded; // Добавляем пользователя в req.user
    next(); // Передаём управление следующему middleware
  } catch (error) {
    res.status(403).json({ message: "Токен недействителен" });
  }
};
