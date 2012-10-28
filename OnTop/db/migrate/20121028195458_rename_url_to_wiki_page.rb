class RenameUrlToWikiPage < ActiveRecord::Migration
  def up
    rename_column :keywords, :url, :wiki_page
  end

  def down
    rename_column :keywords, :wiki_page, :url
  end
end
