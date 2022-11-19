package api

import (
	"net/http"
	"sort"
	"strings"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/samber/lo"
)

type ApiResult struct {
	Title         string      `json:"title"`
	Author        string      `json:"author"`
	Demographic   string      `json:"demographic"`
	Genre         []string    `json:"genre"`
	Tags          []string    `json:"tags"`
	Contact       string      `json:"contact"`
	Synopsis      string      `json:"synopsis"`
	TotalChapter  int         `json:"totalChapter"`
	Rev_share     []RevShare  `json:"rev_share"`
	Cover         Cover       `json:"cover"`
	Chapters      []string    `json:"chapters"`
	ChapterTitles interface{} `json:"chapterTitles"`
	Author_Data   AuthorData  `json:"author_data"`
}

type Cover struct {
	Book        CoverBook      `json:"book"`
	Thumbnail   CoverThumbnail `json:"thumbnail"`
	Placeholder string         `json:"placeholder"`
}

type CoverBook struct {
	Jpeg CoverImageSizes `json:"jpeg"`
	Webp CoverImageSizes `json:"webp"`
}

type CoverImageSizes struct {
	Small  string `json:"1x"`
	Medium string `json:"2x"`
	Large  string `json:"3x"`
}

type CoverThumbnail struct {
	Jpeg string `json:"jpeg"`
	Webp string `json:"webp"`
}

type RevShare struct {
	Name                     string   `json:"name"`
	Weight                   int      `json:"weight"`
	PaymentPointer           string   `json:"paymentPointer"`
	WebfundingPaymentPointer string   `json:"webfundingPaymentPointer"`
	Roles                    []string `json:"roles"`
}

type AuthorData struct {
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
	ID     string `json:"id"`
}

func APINovelRoute(e *core.ServeEvent) error {
	// add new "GET /api/hello" route to the app router (echo)
	e.Router.AddRoute(echo.Route{
		Method: http.MethodGet,
		Path:   "/api/novel/:novel-id",
		Handler: func(c echo.Context) error {
			novel_id := c.PathParam("novel-id")
			collection, err := e.App.Dao().FindCollectionByNameOrId("novels")
			volumes_col, err := e.App.Dao().FindCollectionByNameOrId("volumes")
			chapters_col, err := e.App.Dao().FindCollectionByNameOrId("chapters")

			if err != nil {
				return c.String(http.StatusBadRequest, err.Error())
			}

			novel, err := e.App.Dao().FindRecordById(collection, novel_id, nil)
			author_id := novel.GetStringDataValue("author")
			author, _ := e.App.Dao().FindUserById(author_id)

			if err != nil {
				return c.String(http.StatusBadRequest, err.Error())
			}

			genres := strings.Split(novel.GetStringDataValue("genres"), ",")
			tags := strings.Split(novel.GetStringDataValue("tags"), ",")
			chapterTitles := make(map[string]map[string]string)
			chapters := []string{}
			volumes, _ := e.App.Dao().FindRecordsByExpr(volumes_col, dbx.HashExp{
				"novel_parent": novel_id,
			})
			sort.Stable(Records(volumes))

			for _, volume := range volumes {
				vol_id := volume.Id
				chapter_records, _ := e.App.Dao().FindRecordsByExpr(chapters_col, dbx.HashExp{
					"volume_parent": vol_id,
					"novel_parent":  novel_id,
				})
				sort.Stable(Records(chapter_records))
				chapterTitles[vol_id] = make(map[string]string)
				for _, chapter := range chapter_records {
					ch_id := chapter.Id
					chapterTitles[vol_id][ch_id] = chapter.GetStringDataValue("title")
					chapters = append(chapters, vol_id+"/"+ch_id)
				}
			}

			if len(genres) > 0 {
				genres = lo.Map(genres, func(s string, index int) string {
					return strings.TrimSpace(s)
				})
				genres = lo.Filter(genres, func(s string, index int) bool {
					return s != ""
				})
			}
			if len(tags) > 0 {
				tags = lo.Map(tags, func(s string, index int) string {
					return strings.TrimSpace(s)
				})
				tags = lo.Filter(tags, func(s string, index int) bool {
					return s != ""
				})
			}

			result := ApiResult{
				Title:       novel.GetStringDataValue("title"),
				Synopsis:    novel.GetStringDataValue("synopsis"),
				Demographic: novel.GetStringDataValue("demographic"),
				Author:      author.Profile.GetStringDataValue("name"),
				Author_Data: AuthorData{
					ID:     author.Profile.Id,
					Name:   author.Profile.GetStringDataValue("name"),
					Avatar: author.Profile.GetStringDataValue("avatar"),
				},
				Genre:         genres,
				Tags:          tags,
				ChapterTitles: chapterTitles,
				Chapters:      chapters,
			}

			// result := ApiResult{
			// 	title: novel.GetStringDataValue("title"),
			// }

			return c.JSON(http.StatusOK, result)
		},
		Middlewares: []echo.MiddlewareFunc{
			// apis.RequireAdminOrOwnerAuth("user-id"),
		},
	})

	return nil
}

type Records []*models.Record

func (a Records) Len() int { return len(a) }
func (a Records) Less(i, j int) bool {
	return a[i].GetIntDataValue("order") < a[j].GetIntDataValue("order")
}
func (a Records) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
