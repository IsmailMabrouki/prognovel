package api

import (
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase/core"
)

// type ApiResult map[string]interface {
// 	title         string
// 	author        string
// 	demographic   string
// 	genre         []string
// 	tags          []string
// 	contact       string
// 	synopsis      string
// 	totalChapter  int
// 	rev_share     []interface{}
// 	cover         interface{}
// 	chapters      []string
// 	chapterTitles interface{}
// }

func APIInitRoute(e *core.ServeEvent) error {
	// add new "GET /api/hello" route to the app router (echo)
	e.Router.AddRoute(echo.Route{
		Method: http.MethodGet,
		Path:   "/api/init",
		Handler: func(c echo.Context) error {
			id := c.PathParam("novel-id")
			collection, err := e.App.Dao().FindCollectionByNameOrId("novels")

			if err != nil {
				return c.String(http.StatusBadRequest, err.Error())
			}

			novel, err := e.App.Dao().FindRecordById(collection, id, nil)

			if err != nil {
				return c.String(http.StatusBadRequest, err.Error())
			}

			result := make(map[string]interface{})

			result["title"] = novel.GetStringDataValue("title")
			result["synopsis"] = novel.GetStringDataValue("synopsis")
			result["demographic"] = novel.GetStringDataValue("demographic")

			author_id := novel.GetStringDataValue("author")
			author, _ := e.App.Dao().FindUserById(author_id)
			result["author"] = author.Profile.GetDataValue("name")

			return c.JSON(http.StatusOK, result)
		},
		Middlewares: []echo.MiddlewareFunc{
			// apis.RequireAdminOrOwnerAuth("user-id"),
		},
	})

	return nil
}
