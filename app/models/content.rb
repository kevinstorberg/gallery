class Content < ApplicationRecord
  belongs_to :canvass


  def css_styles
    string = ""

    Content.last.styles.to_a.each do |e|
      string += "#{e[0]}: #{e[1]}; "
    end

    string
  end
end